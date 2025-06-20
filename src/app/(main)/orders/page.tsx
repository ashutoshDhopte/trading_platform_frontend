'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useUser } from '@/components/UserContext';
import { getOrders } from '@/lib/api';
import { formatCurrency } from '@/lib/util';
import { Order } from '@/type/model';
import { getSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const gridCols = "grid grid-cols-6 gap-2";

const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <div 
        className={`${gridCols} items-center p-4 mt-2 bg-white/[0.03] rounded-xl border border-white/5 transition-all duration-300 cursor-pointer hover:bg-white/8 hover:border-white/15 min-w-full`}
        style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 2fr 2fr' }} // adjust ratios as needed
    >
        <div>
            <div className="font-mono font-bold text-base text-foreground/90">{order.StockTicker}</div>
            <div className="text-muted-foreground/80 text-sm">{order.StockName}</div>
        </div>
        <div>
            <div className="font-mono font-bold text-base text-foreground/90">{order.CreatedAt.split(' ')[0]}</div>
            <div className="text-muted-foreground/80 text-sm">{order.CreatedAt.split(' ')[1]}</div>
        </div>
        <div className="font-bold text-base flex">
            <span
                className={`px-2 py-1 rounded text-base font-semibold ${
                    order.TradeType === 'BUY'
                        ? 'text-green-400'
                        : 'text-red-400'
                }`}
            >
                {order.TradeType}
            </span>
        </div>
        <div className="font-bold text-base text-right">{order.Quantity}</div>
        <div className="font-bold text-base text-right">{formatCurrency(order.PricePerShareDollars)}</div>
        <div className="font-bold text-base text-right">{formatCurrency(order.TotalOrderValueDollars)}</div>
    </div>
);

const OrdersPage = () => {

    const {user} = useUser();

    const userId = user?.UserID || 0;

    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const getOrdersFromApi = async () => {
            const session = await getSession(); 
            const token = session?.backendToken || ""
            const orders = await getOrders(userId, token); 
            setOrders(orders);
        };

        if (userId) {
            getOrdersFromApi();
        }
    }, [userId]);

    return (
        <section className="w-full relative section-padding flex min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white">
            <div className="w-11/12 max-w-screen-xl mx-auto p-5 mt-35">


                {/* Header */}
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
                    <div className={`${gridCols} mb-5 px-4`} style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 2fr 2fr' }}>
                        <div className="font-bold text-base text-muted-foreground/80 tracking-wide uppercase">Ticker</div>
                        <div className="font-bold text-base text-muted-foreground/80 tracking-wide uppercase">Date</div>
                        <div className="font-bold text-base text-muted-foreground/80 tracking-wide uppercase">Trade</div>
                        <div className="font-bold text-base text-muted-foreground/80 text-right tracking-wide uppercase">Quantity</div>
                        <div className="font-bold text-base text-muted-foreground/80 text-right tracking-wide uppercase">Price</div>
                        <div className="font-bold text-base text-muted-foreground/80 text-right tracking-wide uppercase">Total Value</div>
                    </div>
                    <div className="w-full mx-auto">
                        {orders.map((order) => (
                            <OrderCard key={order.OrderID} order={order} />
                        ))}
                    </div>
                </div>


            </div>
        </section>
    );
};

export default OrdersPage;