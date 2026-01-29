import { useProfitReportQuery } from "../features/reports/reportsApi";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  // const { data = [] } = useProfitReportQuery();

  return (
    <div>
      <h1>Dashboard</h1>

      {/* <BarChart width={500} height={300} data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <Bar dataKey="profit" />
      </BarChart> */}
    </div>
  );
}
