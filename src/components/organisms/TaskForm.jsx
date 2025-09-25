import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import { toast } from "react-toastify";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";

const TaskForm = ({ task, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    title_c: "",
    description_c: "",
    due_date_c: "",
    priority_c: "medium",
    status_c: "pending",
    contact_id_c: "",
    deal_id_c: "",
  });

  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    loadContacts();
    loadDeals();
    
if (task) {
      setFormData({
        title_c: task.title_c || task.title || "",
        description_c: task.description_c || task.description || "",
        due_date_c: task.due_date_c ? task.due_date_c.split("T")[0] : 
                   task.dueDate ? task.dueDate.split("T")[0] : "",
        priority_c: task.priority_c || task.priority || "medium",
        status_c: task.status_c || task.status || "pending",
        contact_id_c: task.contact_id_c || task.contactId || "",
        deal_id_c: task.deal_id_c || task.dealId || "",
      });
    }
  }, [task]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  const loadDeals = async () => {
    try {
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (error) {
      console.error("Failed to load deals:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

if (!formData.title_c.trim()) {
      newErrors.title_c = "Task title is required";
    }

if (!formData.due_date_c) {
      newErrors.due_date_c = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      toast.success(task ? "Task updated successfully!" : "Task created successfully!");
      onCancel();
    } catch (error) {
      toast.error("Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
<Input
        label="Task Title"
        name="title_c"
        value={formData.title_c}
        onChange={handleChange}
        error={errors.title_c}
        placeholder="Enter task title"
      />
      />

<Textarea
        label="Description"
        name="description_c"
        value={formData.description_c}
        onChange={handleChange}
        placeholder="Enter task description (optional)"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<Input
          label="Due Date"
          name="due_date_c"
          type="date"
          value={formData.due_date_c}
          onChange={handleChange}
          error={errors.due_date_c}
        />

<Select
          label="Priority"
          name="priority_c"
          value={formData.priority_c}
          onChange={handleChange}
        >
          {priorities.map(priority => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </Select>

<Select
          label="Status"
          name="status_c"
          value={formData.status_c}
          onChange={handleChange}
        >
          {statuses.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Select
          label="Related Contact (Optional)"
          name="contact_id_c"
          value={formData.contact_id_c}
          onChange={handleChange}
        >
          <option value="">Select a contact</option>
{contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.first_name_c || contact.firstName} {contact.last_name_c || contact.lastName} - {contact.company_c || contact.company}
            </option>
          ))}
        </Select>

<Select
          label="Related Deal (Optional)"
          name="deal_id_c"
          value={formData.deal_id_c}
          onChange={handleChange}
        >
          <option value="">Select a deal</option>
{deals.map(deal => (
            <option key={deal.Id} value={deal.Id}>
              {deal.title_c || deal.title}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : (task ? "Update Task" : "Create Task")}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;