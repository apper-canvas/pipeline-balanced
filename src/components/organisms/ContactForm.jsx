import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { toast } from "react-toastify";

const ContactForm = ({ contact, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    first_name_c: "",
    last_name_c: "",
    email_c: "",
    phone_c: "",
    company_c: "",
    position_c: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
if (contact) {
      setFormData({
        first_name_c: contact.first_name_c || contact.firstName || "",
        last_name_c: contact.last_name_c || contact.lastName || "",
        email_c: contact.email_c || contact.email || "",
        phone_c: contact.phone_c || contact.phone || "",
        company_c: contact.company_c || contact.company || "",
        position_c: contact.position_c || contact.position || "",
      });
    }
  }, [contact]);

  const validateForm = () => {
    const newErrors = {};

if (!formData.first_name_c.trim()) {
      newErrors.first_name_c = "First name is required";
    }

if (!formData.last_name_c.trim()) {
      newErrors.last_name_c = "Last name is required";
    }

if (!formData.email_c.trim()) {
      newErrors.email_c = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email_c)) {
      newErrors.email_c = "Email is invalid";
    }

if (!formData.phone_c.trim()) {
      newErrors.phone_c = "Phone is required";
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
      toast.success(contact ? "Contact updated successfully!" : "Contact created successfully!");
      onCancel();
    } catch (error) {
      toast.error("Failed to save contact. Please try again.");
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
<Input
          label="First Name"
          name="first_name_c"
          value={formData.first_name_c}
          onChange={handleChange}
          error={errors.first_name_c}
          placeholder="Enter first name"
        />

<Input
          label="Last Name"
          name="last_name_c"
          value={formData.last_name_c}
          onChange={handleChange}
          error={errors.last_name_c}
          placeholder="Enter last name"
        />
      </div>

<Input
        label="Email"
        name="email_c"
        type="email"
        value={formData.email_c}
        onChange={handleChange}
        error={errors.email_c}
        placeholder="Enter email address"
      />

<Input
        label="Phone"
        name="phone_c"
        value={formData.phone_c}
        onChange={handleChange}
        error={errors.phone_c}
        placeholder="Enter phone number"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Input
          label="Company"
          name="company_c"
          value={formData.company_c}
          onChange={handleChange}
          placeholder="Enter company name"
        />

<Input
          label="Position"
          name="position_c"
          value={formData.position_c}
          onChange={handleChange}
          placeholder="Enter job title"
        />
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
          {isSubmitting ? "Saving..." : (contact ? "Update Contact" : "Create Contact")}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;