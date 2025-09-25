import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";
import taskService from "@/services/api/taskService";
import activityService from "@/services/api/activityService";
import { format } from "date-fns";

const Dashboard = () => {
  const [data, setData] = useState({
    contacts: [],
    deals: [],
    tasks: [],
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [contacts, deals, tasks, activities] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        taskService.getAll(),
        activityService.getAll(),
      ]);

      setData({ contacts, deals, tasks, activities });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading type="cards" className="p-6" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

// Calculate metrics
  const totalDeals = data.deals.length;
  const activeDeals = data.deals.filter(deal => !["closed-won", "closed-lost"].includes(deal.stage_c || deal.stage)).length;
  const totalValue = data.deals.reduce((sum, deal) => sum + (deal.value_c || deal.value || 0), 0);
  const wonValue = data.deals
    .filter(deal => (deal.stage_c || deal.stage) === "closed-won")
    .reduce((sum, deal) => sum + (deal.value_c || deal.value || 0), 0);
  
const pendingTasks = data.tasks.filter(task => (task.status_c || task.status) === "pending").length;
  const recentActivities = data.activities
    .sort((a, b) => new Date(b.created_at_c || b.createdAt || b.CreatedOn) - new Date(a.created_at_c || a.createdAt || a.CreatedOn))
    .slice(0, 5);

  const getActivityIcon = (type) => {
    const icons = {
      call: "Phone",
      email: "Mail",
      meeting: "Calendar",
      note: "FileText",
    };
    return icons[type] || "Activity";
  };

  const getTaskPriorityColor = (priority) => {
    const colors = {
      urgent: "error",
      high: "warning",
      medium: "info",
      low: "default",
    };
    return colors[priority] || "default";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-secondary mt-1">Welcome back! Here's your sales overview.</p>
        </div>
        <Button variant="primary" className="inline-flex items-center">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Quick Action
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={data.contacts.length}
          icon="Users"
          color="primary"
        />
        <StatCard
          title="Active Deals"
          value={activeDeals}
          change={`${totalDeals} total`}
          changeType="neutral"
          icon="TrendingUp"
          color="success"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${totalValue.toLocaleString()}`}
          change={`$${wonValue.toLocaleString()} won`}
          changeType="positive"
          icon="DollarSign"
          color="primary"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          change={`${data.tasks.length} total`}
          changeType="neutral"
          icon="CheckSquare"
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <Button variant="ghost" size="sm">
                View all
                <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
{recentActivities.map((activity) => {
                const contact = data.contacts.find(c => c.Id === parseInt(activity.contact_id_c || activity.contactId));
                return (
                  <div key={activity.Id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
<ApperIcon 
                        name={getActivityIcon(activity.type_c || activity.type)} 
                        className="w-4 h-4 text-primary" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
<p className="text-sm font-medium text-gray-900">{activity.subject_c || activity.subject}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {contact && (
<span className="text-xs text-gray-500">
                            {contact.first_name_c || contact.firstName} {contact.last_name_c || contact.lastName}
                          </span>
                        )}
<span className="text-xs text-gray-400">
                          {format(new Date(activity.created_at_c || activity.createdAt || activity.CreatedOn), "MMM dd, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
              <Button variant="ghost" size="sm">
                View all
                <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
{data.tasks
                .filter(task => (task.status_c || task.status) !== "completed")
                .sort((a, b) => new Date(a.due_date_c || a.dueDate) - new Date(b.due_date_c || b.dueDate))
                .slice(0, 5)
                .map((task) => {
                  const contact = data.contacts.find(c => c.Id === parseInt(task.contact_id_c || task.contactId));
                  return (
                    <div key={task.Id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
<p className="text-sm font-medium text-gray-900 truncate">
                          {task.title_c || task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
<Badge variant={getTaskPriorityColor(task.priority_c || task.priority)} className="text-xs">
                            {task.priority_c || task.priority}
                          </Badge>
                          {contact && (
<span className="text-xs text-gray-500">
                              {contact.first_name_c || contact.firstName} {contact.last_name_c || contact.lastName}
                            </span>
                          )}
                        </div>
                      </div>
<span className="text-xs text-gray-400 ml-2">
                        {format(new Date(task.due_date_c || task.dueDate), "MMM dd")}
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Pipeline Overview</h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { stage: "lead", name: "Lead", color: "bg-gray-100" },
              { stage: "qualified", name: "Qualified", color: "bg-blue-100" },
              { stage: "proposal", name: "Proposal", color: "bg-yellow-100" },
              { stage: "negotiation", name: "Negotiation", color: "bg-orange-100" },
              { stage: "closed-won", name: "Won", color: "bg-green-100" },
              { stage: "closed-lost", name: "Lost", color: "bg-red-100" },
].map((stage) => {
              const stageDeals = data.deals.filter(deal => (deal.stage_c || deal.stage) === stage.stage);
              const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value_c || deal.value || 0), 0);
              
              return (
                <div key={stage.stage} className={`p-4 rounded-lg ${stage.color}`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {stageDeals.length}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {stage.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      ${stageValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;