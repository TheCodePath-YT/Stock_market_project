const Stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];

async function fetchChartData() {
    const response = await fetch(`https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata`);
    if (!response.ok) throw new Error('Failed to fetch chart data');
    return await response.json();
}

async function fetchBookValue() {
    const response = await fetch(`https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata`);
    if (!response.ok) throw new Error('Failed to fetch book value');
    return await response.json();
}

async function fetchStockDetails() {
    const response = await fetch(`https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata`);
    if (!response.ok) throw new Error('Failed to fetch stock details');
    return await response.json();
}
let currentStock = 'AAPL';
let chartInstance;
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const chartData = await fetchChartData();
        const bookValueData = await fetchBookValue();
        const stockDetailsData = await fetchStockDetails();
        renderChart(chartData.stocksData[0].AAPL["1mo"]);
        renderStockList(stockDetailsData.stocksStatsData[0], bookValueData.stocksProfileData[0], chartData);
        renderStockDetails(bookValueData.stocksProfileData[0], currentStock, stockDetailsData.stocksStatsData[0]);

        document.getElementById('btn1Month').addEventListener('click', () => updateChart(chartData, '1mo'));
        document.getElementById('btn3Month').addEventListener('click', () => updateChart(chartData, '3mo'));
        document.getElementById('btn1Year').addEventListener('click', () => updateChart(chartData, '1y'));
        document.getElementById('btn5Year').addEventListener('click', () => updateChart(chartData, '5y'));
    } catch (error) {
        console.error('Error fetching or rendering chart data:', error);
    }
});

function updateChart(chartData, timeframe) {
    const data = chartData.stocksData[0][currentStock][timeframe];
    renderChart(data);
}

function renderChart(data) {
    const ctx = document.getElementById('stockChart');
    const maxValue = Math.max(...data.value);
    const minValue = Math.min(...data.value);
    const maxIndex = data.value.indexOf(maxValue);
    const minIndex = data.value.indexOf(minValue);
    if (chartInstance) {
        chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.timeStamp,
            datasets: [{
                label: 'Stock Analysis',
                data: data.value,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            }
        }
    });
}

function renderStockList(bookValueData, sumarydata, chartData) {
    const stockListDiv = document.getElementById('stock-list');
    stockListDiv.innerHTML = '';
    Stocks.forEach(stock => {
        if (!bookValueData[stock]) return;
        const bookValue = bookValueData[stock]?.bookValue || 'N/A';
        const profit = bookValueData[stock]?.profit.toFixed(2) || 'N/A';

        const stockDiv = document.createElement('div');
        const stockbookvalue = document.createElement('div');
        stockDiv.className = 'stock-item';
        stockbookvalue.className = profit == 0.00 ? 'stock-loss' : 'stock-profit'
        stockDiv.innerHTML = `
            <h3>${stock}</h3>`
        stockbookvalue.innerHTML = `
            <p> $${bookValue}</p>
            <p>${profit}%</p>
        `;
        stockDiv.addEventListener('click', () => {
            // alert(`Stock: ${stock}\nBook Value: ${bookValue}\nProfit: ${profit}`);
            currentStock = stock;
            renderStockDetails(sumarydata, stock, bookValueData);
            renderChart(chartData.stocksData[0][stock]["1mo"]);
        });

        stockListDiv.appendChild(stockDiv);
        stockDiv.appendChild(stockbookvalue);
    });
}
function renderStockDetails(data, stock, bookProfitData) {
    const bookValue = bookProfitData[stock]?.bookValue || 'N/A';
    const profit = bookProfitData[stock]?.profit.toFixed(2) || 'N/A';
    const stockSummaryDiv = document.getElementById('stock-summary');
    const stockDetailsDiv = document.getElementById('stock-details-summ');
    stockDetailsDiv.innerHTML = `
        <p>${stock}</p>
        <p>$${bookValue}</p>
        <p>${profit}%</p>
    `;
    data[stock] ? stockSummaryDiv.innerHTML = `<p>${data[stock].summary}</p>` : '';


}