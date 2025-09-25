import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import TaskForm from "@/components/organisms/TaskForm";
import ApperIcon from "@/components/ApperIcon";
import taskService from "@/services/api/taskService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTasksData();
  }, []);

  const loadTasksData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tasksData, contactsData, dealsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll(),
        dealService.getAll(),
      ]);
      setTasks(tasksData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      throw new Error("Failed to create task");
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
const updatedTask = await taskService.update(selectedTask.Id, taskData);
      setTasks(prev => prev.map(task => 
        task.Id === updatedTask.Id ? updatedTask : task
      ));
    } catch (error) {
      throw new Error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    
try {
      const updatedTask = await taskService.update(task.Id, { ...task, status_c: newStatus });
      setTasks(prev => prev.map(t => t.Id === updatedTask.Id ? updatedTask : t));
      toast.success(`Task marked as ${newStatus}!`);
    } catch (error) {
      toast.error("Failed to update task status. Please try again.");
    }
  };

  const getContact = (contactId) => {
return contacts.find(contact => contact.Id === parseInt(contactId));
  };

  const getDeal = (dealId) => {
    return deals.find(deal => deal.Id === parseInt(dealId));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "error",
      high: "warning",
      medium: "info",
      low: "default",
    };
    return colors[priority] || "default";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      "in-progress": "info",
      completed: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title_c || task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description_c || task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    
const matchesFilter = filterStatus === "all" || (task.status_c || task.status) === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const openCreateForm = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  if (loading) {
    return <Loading type="table" className="p-6" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadTasksData} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-secondary mt-1">Manage your to-do items and follow-ups</p>
        </div>
        <Button variant="primary" onClick={openCreateForm} className="inline-flex items-center">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1 max-w-md"
        />
        
        <div className="flex space-x-2">
          {["all", "pending", "in-progress", "completed"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status === "all" ? "All Tasks" : status.replace("-", " ")}
            </Button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Empty
          title="No tasks found"
          description={searchTerm ? "No tasks match your search criteria" : "Get started by creating your first task"}
          icon="CheckSquare"
          actionLabel={!searchTerm ? "Add Task" : undefined}
          onAction={!searchTerm ? openCreateForm : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => {
const contact = getContact(task.contact_id_c);
            const deal = getDeal(task.deal_id_c);
            
            return (
              <Card key={task.Id} className="card-hover">
                <Card.Content className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
(task.status_c || task.status) === "completed"
                          ? "bg-success border-success"
                            : "border-gray-300 hover:border-success"
                        }`}
                      >
{(task.status_c || task.status) === "completed" && (
                          <ApperIcon name="Check" className="w-3 h-3 text-white" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
<h3 className={`font-semibold ${(task.status_c || task.status) === "completed" ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {task.title_c || task.title}
                          </h3>
<Badge variant={getPriorityColor(task.priority_c || task.priority)}>
                            {task.priority_c || task.priority}
                          </Badge>
                          <Badge variant={getStatusColor(task.status_c || task.status)}>
                            {task.status_c || task.status}
                          </Badge>
                        </div>
                        
{(task.description_c || task.description) && (
                          <p className="text-gray-600 text-sm mb-3">{task.description_c || task.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Calendar" className="w-4 h-4" />
<span>{format(new Date(task.due_date_c || task.dueDate), "MMM dd, yyyy")}</span>
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
                        onClick={() => openEditForm(task)}
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.Id)}
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

      {/* Task Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeModal}
        title={selectedTask ? "Edit Task" : "Add New Task"}
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          onSave={selectedTask ? handleUpdateTask : handleCreateTask}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Tasks;