import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ActivityForm from "@/components/organisms/ActivityForm";
import ApperIcon from "@/components/ApperIcon";
import activityService from "@/services/api/activityService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadActivitiesData();
  }, []);

  const loadActivitiesData = async () => {
    try {
      setLoading(true);
      setError("");
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll(),
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load activities. Please try again.");
      console.error("Activities error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (activityData) => {
    try {
      const newActivity = await activityService.create(activityData);
      setActivities(prev => [newActivity, ...prev]);
    } catch (error) {
      throw new Error("Failed to create activity");
    }
  };

  const handleUpdateActivity = async (activityData) => {
    try {
const updatedActivity = await activityService.update(selectedActivity.Id, activityData);
      setActivities(prev => prev.map(activity => 
        activity.Id === updatedActivity.Id ? updatedActivity : activity
      ));
    } catch (error) {
      throw new Error("Failed to update activity");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      await activityService.delete(activityId);
      setActivities(prev => prev.filter(activity => activity.Id !== activityId));
      toast.success("Activity deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete activity. Please try again.");
    }
  };

  const getContact = (contactId) => {
    return contacts.find(contact => contact.Id === parseInt(contactId));
  };

  const getDeal = (dealId) => {
    return deals.find(deal => deal.Id === parseInt(dealId));
  };

  const getActivityIcon = (type) => {
    const icons = {
      call: "Phone",
      email: "Mail",
      meeting: "Calendar",
      note: "FileText",
    };
    return icons[type] || "Activity";
  };

  const getActivityColor = (type) => {
    const colors = {
      call: "info",
      email: "primary",
      meeting: "success",
      note: "warning",
    };
    return colors[type] || "default";
  };

  const filteredActivities = activities.filter(activity => {
const matchesSearch = (activity.subject_c || activity.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.description_c || activity.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    
const matchesFilter = filterType === "all" || (activity.type_c || activity.type) === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const openCreateForm = () => {
    setSelectedActivity(null);
    setIsFormOpen(true);
  };

  const openEditForm = (activity) => {
    setSelectedActivity(activity);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedActivity(null);
  };

  if (loading) {
    return <Loading type="table" className="p-6" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadActivitiesData} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-secondary mt-1">Track all customer interactions and communications</p>
        </div>
        <Button variant="primary" onClick={openCreateForm} className="inline-flex items-center">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search activities..."
          className="flex-1 max-w-md"
        />
        
        <div className="flex space-x-2">
          {["all", "call", "email", "meeting", "note"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type === "all" ? "All Types" : type}
            </Button>
          ))}
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <Empty
          title="No activities found"
          description={searchTerm ? "No activities match your search criteria" : "Get started by logging your first activity"}
          icon="Activity"
          actionLabel={!searchTerm ? "Log Activity" : undefined}
          onAction={!searchTerm ? openCreateForm : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredActivities
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
.map((activity) => {
              const contact = getContact(activity.contactId);
              const deal = getDeal(activity.dealId);
              
              return (
                <Card key={activity.Id} className="card-hover">
                  <Card.Content className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
<div className={`p-2 rounded-lg bg-${getActivityColor(activity.type_c || activity.type)}/10`}>
                          <ApperIcon 
                            name={getActivityIcon(activity.type_c || activity.type)} 
                            className={`w-5 h-5 text-${getActivityColor(activity.type_c || activity.type) === 'primary' ? 'blue-600' : 
                              getActivityColor(activity.type_c || activity.type) === 'info' ? 'blue-500' :
                              getActivityColor(activity.type_c || activity.type) === 'success' ? 'green-600' :
                              getActivityColor(activity.type) === 'warning' ? 'yellow-600' : 'gray-600'}`}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
<h3 className="font-semibold text-gray-900">{activity.subject_c || activity.subject}</h3>
                            <Badge variant={getActivityColor(activity.type_c || activity.type)}>
                              {activity.type}
                            </Badge>
                          </div>
                          
<p className="text-gray-600 text-sm mb-3">{activity.description_c || activity.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
<ApperIcon name="Clock" className="w-4 h-4" />
                              <span>{format(new Date(activity.created_at_c || activity.createdAt || activity.CreatedOn), "MMM dd, yyyy 'at' h:mm a")}</span>
                            </div>
                            
                            {contact && (
                              <div className="flex items-center space-x-1">
                                <ApperIcon name="User" className="w-4 h-4" />
<span>{contact.first_name_c || contact.firstName} {contact.last_name_c || contact.lastName}</span>
                              </div>
                            )}
                            
                            {deal && (
                              <div className="flex items-center space-x-1">
                                <ApperIcon name="TrendingUp" className="w-4 h-4" />
<span>{deal.title_c || deal.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(activity)}
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.Id)}
                          className="text-error hover:text-error"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
        </div>
      )}

      {/* Activity Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeModal}
        title={selectedActivity ? "Edit Activity" : "Log New Activity"}
        size="lg"
      >
        <ActivityForm
          activity={selectedActivity}
          onSave={selectedActivity ? handleUpdateActivity : handleCreateActivity}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Activities;