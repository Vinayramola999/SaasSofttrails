import DepartmentGraph from './DepartmentGraph';
import DesignationChart from './DesignationCharts';
import LocationBarGraph from './LocationBarGraph';
import DomainChart from "./DomainChart";

const Dashboard = (setActiveTab) => {
    return (
        <div className="">
            <div className="grid gap-6 grid-cols-2">
                <DepartmentGraph setActiveTab={setActiveTab} />
                <DesignationChart />
            </div>

            <div className="grid gap-6 grid-cols-2 mt-5">
                <DomainChart />
                <LocationBarGraph />
            </div>
        </div>
    );
};
export default Dashboard;