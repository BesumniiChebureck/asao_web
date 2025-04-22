"use client";

import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { getPriceTrend } from '../services/statistics';

export const PriceChart = ({ sellerId, startDate, endDate }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const request = {
                    seller_id: sellerId,
                    start_date: startDate,
                    end_date: endDate
                };

                const data = await getPriceTrend(request);

                setChartData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sellerId, startDate, endDate]);

    const handleProductChange = (e) => {
        setSelectedProduct(e.target.value);
    };

    const getVisibleTraces = () => {
        if (!chartData) return [];

        return chartData.data.data.map(trace => {
            const traceProduct = trace.name.split(' (')[0];
            return {
                ...trace,
                visible: selectedProduct === 'all' || traceProduct === selectedProduct
            };
        });
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                {/* <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} /> */}
                <h1>Загрузка..</h1>
            </div>
        );
    }

    if (error) return <div>Ошибка: {error}</div>;
    if (!chartData) return <div>Данные не найдены</div>;

    return (
        <div className="price-chart-container" style={{background: "var(--main-gradient)"}}>
            <div className="chart-controls">
                <label htmlFor="product-select">Выберите товар: </label>
                <select
                    id="product-select"
                    value={selectedProduct}
                    onChange={handleProductChange}
                >
                    <option value="all">Все товары</option>
                    {chartData.products.map(product => (
                        <option key={product} value={product}>{product}</option>
                    ))}
                </select>
            </div>

            <Plot
                data={getVisibleTraces()}
                layout={{
                    ...chartData.data.layout,
                    title: selectedProduct === 'all'
                        ? 'Динамика цен всех товаров'
                        : `Динамика цен: ${selectedProduct}`,
                }}
                useResizeHandler
                style={{ width: '100%', height: '70vh' }}
                config={{
                    displayModeBar: true,
                    responsive: true,
                }}
            />
        </div>
    );
};