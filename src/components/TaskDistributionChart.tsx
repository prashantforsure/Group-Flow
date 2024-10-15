import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


type Task = {
    id: string
    title: string
    description: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' 
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    
    assigneeId?: string
    startDate: string | null
    dueDate: string | null
    completedAt: string | null
    estimatedHours: number | null
    actualHours: number | null
    subtasks: Task[]
  }

type TaskDistributionChartProps = {
  tasks: Task[];
};

type ChartData = {
  name: string;
  value: number;
};

const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({ tasks }) => {
  const data: ChartData[] = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#A259FF" name="Tasks" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TaskDistributionChart;