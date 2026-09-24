mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN || '';

// 1. 初始化地图
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // 建议用浅色底图突出边界线
    center: [113.236, 23.161], // 以你数据中的荔湾区为中心
    zoom: 11
});

map.on('load', () => {
    // 2. 加载你提供的边界 GeoJSON 数据
    map.addSource('liwan-boundary', {
        type: 'geojson',
        data: './data/广州市区界线.json' 
    });

    // 添加填充层（半透明蓝色）
    map.addLayer({
        id: 'liwan-fill',
        type: 'fill',
        source: 'liwan-boundary',
        paint: {
            'fill-color': '#088',
            'fill-opacity': 0.5
        }
    });

    // 添加轮廓线层（深蓝色实线）
    map.addLayer({
        id: 'liwan-outline',
        type: 'line',
        source: 'liwan-boundary',
        paint: {
            'line-color': '#088',
            'line-width': 2
        }
    });
});

// 3. 搜索联动功能
async function globalSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) return;

    const files = ['酒店.json', '美食.json', '景点周边游.json']; // 你的POI数据文件
    const list = document.getElementById('resultsList');
    list.innerHTML = ""; // 清空旧结果

    for (const file of files) {
        try {
            const response = await fetch(`data/${file}`);
            const data = await response.json();

            // 在所有 features 中模糊匹配名称
            const matches = data.features.filter(f => {
                const name = f.properties.店名 || f.properties.名称 || "";
                return name.includes(keyword);
            });

            matches.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<b>${item.properties.店名 || item.properties.名称}</b><br><small>${item.properties.地址 || ''}</small>`;
                
                // 点击结果列表，地图飞到对应位置
                li.onclick = () => {
                    const coords = item.geometry.coordinates;
                    map.flyTo({
                        center: coords,
                        zoom: 15,
                        speed: 1.2
                    });

                    // 弹出气泡
                    new mapboxgl.Popup()
                        .setLngLat(coords)
                        .setHTML(`<h4>${item.properties.店名 || item.properties.名称}</h4>`)
                        .addTo(map);
                };
                list.appendChild(li);
            });
        } catch (e) {
            console.error("加载文件失败:", file);
        }
    }
}

// 绑定搜索按钮
document.getElementById('searchBtn').addEventListener('click', globalSearch);