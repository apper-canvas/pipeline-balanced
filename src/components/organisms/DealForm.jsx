import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import { toast } from "react-toastify";
import contactService from "@/services/api/contactService";

const DealForm = ({ deal, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    title_c: "",
    value_c: "",
    stage_c: "lead",
    contact_id_c: "",
    probability_c: "10",
    expected_close_date_c: "",
    description_c: "",
  });

  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stages = [
    { value: "lead", label: "Lead" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed-won", label: "Closed Won" },
    { value: "closed-lost", label: "Closed Lost" },
  ];

  useEffect(() => {
    loadContacts();
    
if (deal) {
      setFormData({
        title_c: deal.title_c || deal.title || "",
        value_c: deal.value_c?.toString() || deal.value?.toString() || "",
        stage_c: deal.stage_c || deal.stage || "lead",
        contact_id_c: deal.contact_id_c || deal.contactId || "",
        probability_c: deal.probability_c?.toString() || deal.probability?.toString() || "10",
        expected_close_date_c: deal.expected_close_date_c ? deal.expected_close_date_c.split("T")[0] : 
                               deal.expectedCloseDate ? deal.expectedCloseDate.split("T")[0] : "",
        description_c: deal.description_c || deal.description || "",
      });
    }
  }, [deal]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

if (!formData.title_c.trim()) {
      newErrors.title_c = "Deal title is required";
    }

if (!formData.value_c.trim()) {
      newErrors.value_c = "Deal value is required";
    } else if (isNaN(Number(formData.value_c)) || Number(formData.value_c) <= 0) {
      newErrors.value_c = "Deal value must be a positive number";
    }

if (!formData.contact_id_c) {
      newErrors.contact_id_c = "Contact is required";
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
const dealData = {
        ...formData,
        value_c: Number(formData.value_c),
        probability_c: Number(formData.probability_c),
      };

      await onSave(dealData);
      toast.success(deal ? "Deal updated successfully!" : "Deal created successfully!");
      onCancel();
    } catch (error) {
      toast.error("Failed to save deal. Please try again.");
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
        label="Deal Title"
        name="title_c"
        value={formData.title_c}
        onChange={handleChange}
        error={errors.title_c}
        placeholder="Enter deal title"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Input
          label="Deal Value ($)"
          name="value_c"
          type="number"
          value={formData.value_c}
          onChange={handleChange}
          error={errors.value_c}
          placeholder="Enter deal value"
        />

<Select
          label="Stage"
          name="stage_c"
          value={formData.stage_c}
          onChange={handleChange}
        >
          {stages.map(stage => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Select
          label="Contact"
          name="contact_id_c"
          value={formData.contact_id_c}
          onChange={handleChange}
          error={errors.contact_id_c}
        >
          <option value="">Select a contact</option>
{contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.first_name_c || contact.firstName} {contact.last_name_c || contact.lastName} - {contact.company_c || contact.company}
            </option>
          ))}
        </Select>

<Select
          label="Probability (%)"
          name="probability_c"
          value={formData.probability_c}
          onChange={handleChange}
        >
          <option value="10">10%</option>
          <option value="25">25%</option>
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="90">90%</option>
          <option value="100">100%</option>
        </Select>
      </div>

<Input
        label="Expected Close Date"
        name="expected_close_date_c"
        type="date"
        value={formData.expected_close_date_c}
        onChange={handleChange}
      />
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter deal description (optional)"
        rows={3}
      />

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
          {isSubmitting ? "Saving..." : (deal ? "Update Deal" : "Create Deal")}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;