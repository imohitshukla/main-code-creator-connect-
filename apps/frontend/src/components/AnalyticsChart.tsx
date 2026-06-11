import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AnalyticsData {
  id: number;
  title: string;
  engagement_rate?: number;
  roi?: number;
  avg_engagement?: number;
  avg_roi?: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  // Simple bar chart representation (can be enhanced with a charting library like Chart.js or Recharts)
  const maxEngagement = Math.max(...data.map(item => item.engagement_rate || item.avg_engagement || 0));
  const maxROI = Math.max(...data.map(item => item.roi || item.avg_roi || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => {
            const engagement = item.engagement_rate || item.avg_engagement || 0;
            const roi = item.roi || item.avg_roi || 0;

            return (
              <div key={item.id} className="space-y-2">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Engagement</span>
                      <span>{engagement.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${maxEngagement > 0 ? (engagement / maxEngagement) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>ROI</span>
                      <span>${roi.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${maxROI > 0 ? (roi / maxROI) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {data.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No analytics data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
