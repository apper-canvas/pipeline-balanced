import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import { toast } from "react-toastify";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";

const ActivityForm = ({ activity, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    type_c: "call",
    subject_c: "",
    description_c: "",
    contact_id_c: "",
    deal_id_c: "",
  });

  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes = [
    { value: "call", label: "Phone Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "note", label: "Note" },
  ];

  useEffect(() => {
    loadContacts();
    loadDeals();
    
if (activity) {
      setFormData({
        type_c: activity.type_c || activity.type || "call",
        subject_c: activity.subject_c || activity.subject || "",
        description_c: activity.description_c || activity.description || "",
        contact_id_c: activity.contact_id_c || activity.contactId || "",
        deal_id_c: activity.deal_id_c || activity.dealId || "",
      });
    }
  }, [activity]);

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

if (!formData.subject_c.trim()) {
      newErrors.subject_c = "Subject is required";
    }

if (!formData.description_c.trim()) {
      newErrors.description_c = "Description is required";
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
      toast.success(activity ? "Activity updated successfully!" : "Activity logged successfully!");
      onCancel();
    } catch (error) {
      toast.error("Failed to save activity. Please try again.");
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Select
          label="Activity Type"
          name="type_c"
          value={formData.type_c}
          onChange={handleChange}
        >
          {activityTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>

<Input
          label="Subject"
          name="subject_c"
          value={formData.subject_c}
          onChange={handleChange}
          error={errors.subject_c}
          placeholder="Enter activity subject"
        />
      </div>

<Textarea
        label="Description"
        name="description_c"
        value={formData.description_c}
        onChange={handleChange}
        error={errors.description_c}
        placeholder="Enter activity details..."
        rows={4}
      />

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
          {isSubmitting ? "Saving..." : (activity ? "Update Activity" : "Log Activity")}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;