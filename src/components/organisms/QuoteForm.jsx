import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const QuoteForm = ({ quote, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    Name: "",
    company_c: "",
    contact_id_c: "",
    deal_id_c: "",
    quote_date_c: new Date().toISOString().slice(0, 16),
    status_c: "Draft",
    delivery_method_c: "",
    expires_on_c: "",
    billing_address_bill_to_name_c: "",
    billing_address_street_c: "",
    billing_address_city_c: "",
    billing_address_state_c: "",
    billing_address_country_c: "",
    billing_address_pincode_c: "",
    shipping_address_ship_to_name_c: "",
    shipping_address_street_c: "",
    shipping_address_city_c: "",
    shipping_address_state_c: "",
    shipping_address_country_c: "",
    shipping_address_pincode_c: "",
  });
  
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
  ];

  useEffect(() => {
    loadData();
    
    if (quote) {
      setFormData({
        Name: quote.Name || "",
        company_c: quote.company_c || "",
        contact_id_c: quote.contact_id_c?.Id || quote.contact_id_c || "",
        deal_id_c: quote.deal_id_c?.Id || quote.deal_id_c || "",
        quote_date_c: quote.quote_date_c ? quote.quote_date_c.slice(0, 16) : "",
        status_c: quote.status_c || "Draft",
        delivery_method_c: quote.delivery_method_c || "",
        expires_on_c: quote.expires_on_c ? quote.expires_on_c.slice(0, 16) : "",
        billing_address_bill_to_name_c: quote.billing_address_bill_to_name_c || "",
        billing_address_street_c: quote.billing_address_street_c || "",
        billing_address_city_c: quote.billing_address_city_c || "",
        billing_address_state_c: quote.billing_address_state_c || "",
        billing_address_country_c: quote.billing_address_country_c || "",
        billing_address_pincode_c: quote.billing_address_pincode_c || "",
        shipping_address_ship_to_name_c: quote.shipping_address_ship_to_name_c || "",
        shipping_address_street_c: quote.shipping_address_street_c || "",
        shipping_address_city_c: quote.shipping_address_city_c || "",
        shipping_address_state_c: quote.shipping_address_state_c || "",
        shipping_address_country_c: quote.shipping_address_country_c || "",
        shipping_address_pincode_c: quote.shipping_address_pincode_c || "",
      });
    }
  }, [quote]);

  const loadData = async () => {
    try {
      const [contactsData, dealsData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Failed to load form data");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) {
      newErrors.Name = "Quote name is required";
    }

    if (!formData.company_c.trim()) {
      newErrors.company_c = "Company is required";
    }

    if (!formData.contact_id_c) {
      newErrors.contact_id_c = "Contact is required";
    }

    if (!formData.quote_date_c) {
      newErrors.quote_date_c = "Quote date is required";
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
      const quoteData = {
        ...formData,
        contact_id_c: formData.contact_id_c ? parseInt(formData.contact_id_c) : null,
        deal_id_c: formData.deal_id_c ? parseInt(formData.deal_id_c) : null,
        quote_date_c: formData.quote_date_c ? new Date(formData.quote_date_c).toISOString() : null,
        expires_on_c: formData.expires_on_c ? new Date(formData.expires_on_c).toISOString() : null,
      };

      await onSave(quoteData);
      toast.success(quote ? "Quote updated successfully!" : "Quote created successfully!");
      onCancel();
    } catch (error) {
      toast.error("Failed to save quote. Please try again.");
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

  const handleCopyBillingToShipping = (e) => {
    const checked = e.target.checked;
    setCopyBillingToShipping(checked);
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shipping_address_ship_to_name_c: prev.billing_address_bill_to_name_c,
        shipping_address_street_c: prev.billing_address_street_c,
        shipping_address_city_c: prev.billing_address_city_c,
        shipping_address_state_c: prev.billing_address_state_c,
        shipping_address_country_c: prev.billing_address_country_c,
        shipping_address_pincode_c: prev.billing_address_pincode_c,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <Input
          label="Quote Name"
          name="Name"
          value={formData.Name}
          onChange={handleChange}
          error={errors.Name}
          placeholder="Enter quote name"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company"
            name="company_c"
            value={formData.company_c}
            onChange={handleChange}
            error={errors.company_c}
            placeholder="Enter company name"
          />

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
                {contact.first_name_c} {contact.last_name_c} - {contact.company_c}
              </option>
            ))}
          </Select>
        </div>

        <Select
          label="Deal (Optional)"
          name="deal_id_c"
          value={formData.deal_id_c}
          onChange={handleChange}
        >
          <option value="">Select a deal</option>
          {deals.map(deal => (
            <option key={deal.Id} value={deal.Id}>
              {deal.title_c} - ${deal.value_c}
            </option>
          ))}
        </Select>
      </div>

      {/* Dates and Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Dates & Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quote Date"
            name="quote_date_c"
            type="datetime-local"
            value={formData.quote_date_c}
            onChange={handleChange}
            error={errors.quote_date_c}
          />

          <Input
            label="Expires On"
            name="expires_on_c"
            type="datetime-local"
            value={formData.expires_on_c}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status_c"
            value={formData.status_c}
            onChange={handleChange}
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>

          <Input
            label="Delivery Method"
            name="delivery_method_c"
            value={formData.delivery_method_c}
            onChange={handleChange}
            placeholder="e.g., Email, Mail, Pickup"
          />
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
        
        <Input
          label="Bill To Name"
          name="billing_address_bill_to_name_c"
          value={formData.billing_address_bill_to_name_c}
          onChange={handleChange}
          placeholder="Enter billing contact name"
        />

        <Input
          label="Street Address"
          name="billing_address_street_c"
          value={formData.billing_address_street_c}
          onChange={handleChange}
          placeholder="Enter street address"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            name="billing_address_city_c"
            value={formData.billing_address_city_c}
            onChange={handleChange}
            placeholder="Enter city"
          />

          <Input
            label="State"
            name="billing_address_state_c"
            value={formData.billing_address_state_c}
            onChange={handleChange}
            placeholder="Enter state"
          />

          <Input
            label="Pincode"
            name="billing_address_pincode_c"
            value={formData.billing_address_pincode_c}
            onChange={handleChange}
            placeholder="Enter pincode"
          />
        </div>

        <Input
          label="Country"
          name="billing_address_country_c"
          value={formData.billing_address_country_c}
          onChange={handleChange}
          placeholder="Enter country"
        />
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={copyBillingToShipping}
              onChange={handleCopyBillingToShipping}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">Same as billing</span>
          </label>
        </div>
        
        <Input
          label="Ship To Name"
          name="shipping_address_ship_to_name_c"
          value={formData.shipping_address_ship_to_name_c}
          onChange={handleChange}
          placeholder="Enter shipping contact name"
        />

        <Input
          label="Street Address"
          name="shipping_address_street_c"
          value={formData.shipping_address_street_c}
          onChange={handleChange}
          placeholder="Enter street address"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            name="shipping_address_city_c"
            value={formData.shipping_address_city_c}
            onChange={handleChange}
            placeholder="Enter city"
          />

          <Input
            label="State"
            name="shipping_address_state_c"
            value={formData.shipping_address_state_c}
            onChange={handleChange}
            placeholder="Enter state"
          />

          <Input
            label="Pincode"
            name="shipping_address_pincode_c"
            value={formData.shipping_address_pincode_c}
            onChange={handleChange}
            placeholder="Enter pincode"
          />
        </div>

        <Input
          label="Country"
          name="shipping_address_country_c"
          value={formData.shipping_address_country_c}
          onChange={handleChange}
          placeholder="Enter country"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
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
          {isSubmitting ? "Saving..." : (quote ? "Update Quote" : "Create Quote")}
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;