class QuoteService {
  constructor() {
    this.tableName = 'quote_c';
    this.apperClient = null;
  }

  getApperClient() {
    if (!this.apperClient) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    return this.apperClient;
  }

  async getAll() {
    try {
      const client = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "delivery_method_c"}},
          {"field": {"Name": "expires_on_c"}},
          {"field": {"Name": "billing_address_bill_to_name_c"}},
          {"field": {"Name": "billing_address_street_c"}},
          {"field": {"Name": "billing_address_city_c"}},
          {"field": {"Name": "billing_address_state_c"}},
          {"field": {"Name": "billing_address_country_c"}},
          {"field": {"Name": "billing_address_pincode_c"}},
          {"field": {"Name": "shipping_address_ship_to_name_c"}},
          {"field": {"Name": "shipping_address_street_c"}},
          {"field": {"Name": "shipping_address_city_c"}},
          {"field": {"Name": "shipping_address_state_c"}},
          {"field": {"Name": "shipping_address_country_c"}},
          {"field": {"Name": "shipping_address_pincode_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch quotes:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quotes:", error?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const client = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "delivery_method_c"}},
          {"field": {"Name": "expires_on_c"}},
          {"field": {"Name": "billing_address_bill_to_name_c"}},
          {"field": {"Name": "billing_address_street_c"}},
          {"field": {"Name": "billing_address_city_c"}},
          {"field": {"Name": "billing_address_state_c"}},
          {"field": {"Name": "billing_address_country_c"}},
          {"field": {"Name": "billing_address_pincode_c"}},
          {"field": {"Name": "shipping_address_ship_to_name_c"}},
          {"field": {"Name": "shipping_address_street_c"}},
          {"field": {"Name": "shipping_address_city_c"}},
          {"field": {"Name": "shipping_address_state_c"}},
          {"field": {"Name": "shipping_address_country_c"}},
          {"field": {"Name": "shipping_address_pincode_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error?.message || error);
      return null;
    }
  }

  async create(quoteData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: quoteData.Name || `Quote - ${new Date().toLocaleDateString()}`,
          company_c: quoteData.company_c || "",
          contact_id_c: quoteData.contact_id_c ? parseInt(quoteData.contact_id_c) : null,
          deal_id_c: quoteData.deal_id_c ? parseInt(quoteData.deal_id_c) : null,
          quote_date_c: quoteData.quote_date_c || new Date().toISOString(),
          status_c: quoteData.status_c || "Draft",
          delivery_method_c: quoteData.delivery_method_c || "",
          expires_on_c: quoteData.expires_on_c || null,
          billing_address_bill_to_name_c: quoteData.billing_address_bill_to_name_c || "",
          billing_address_street_c: quoteData.billing_address_street_c || "",
          billing_address_city_c: quoteData.billing_address_city_c || "",
          billing_address_state_c: quoteData.billing_address_state_c || "",
          billing_address_country_c: quoteData.billing_address_country_c || "",
          billing_address_pincode_c: quoteData.billing_address_pincode_c || "",
          shipping_address_ship_to_name_c: quoteData.shipping_address_ship_to_name_c || "",
          shipping_address_street_c: quoteData.shipping_address_street_c || "",
          shipping_address_city_c: quoteData.shipping_address_city_c || "",
          shipping_address_state_c: quoteData.shipping_address_state_c || "",
          shipping_address_country_c: quoteData.shipping_address_country_c || "",
          shipping_address_pincode_c: quoteData.shipping_address_pincode_c || ""
        }]
      };

      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create quote:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} quotes:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating quote:", error?.message || error);
      throw error;
    }
  }

  async update(id, quoteData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: quoteData.Name || `Quote - ${new Date().toLocaleDateString()}`,
          company_c: quoteData.company_c || "",
          contact_id_c: quoteData.contact_id_c ? parseInt(quoteData.contact_id_c) : null,
          deal_id_c: quoteData.deal_id_c ? parseInt(quoteData.deal_id_c) : null,
          quote_date_c: quoteData.quote_date_c || null,
          status_c: quoteData.status_c || "Draft",
          delivery_method_c: quoteData.delivery_method_c || "",
          expires_on_c: quoteData.expires_on_c || null,
          billing_address_bill_to_name_c: quoteData.billing_address_bill_to_name_c || "",
          billing_address_street_c: quoteData.billing_address_street_c || "",
          billing_address_city_c: quoteData.billing_address_city_c || "",
          billing_address_state_c: quoteData.billing_address_state_c || "",
          billing_address_country_c: quoteData.billing_address_country_c || "",
          billing_address_pincode_c: quoteData.billing_address_pincode_c || "",
          shipping_address_ship_to_name_c: quoteData.shipping_address_ship_to_name_c || "",
          shipping_address_street_c: quoteData.shipping_address_street_c || "",
          shipping_address_city_c: quoteData.shipping_address_city_c || "",
          shipping_address_state_c: quoteData.shipping_address_state_c || "",
          shipping_address_country_c: quoteData.shipping_address_country_c || "",
          shipping_address_pincode_c: quoteData.shipping_address_pincode_c || ""
        }]
      };

      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update quote:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} quotes:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating quote:", error?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const client = this.getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await client.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to delete quote:", response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} quotes:`, JSON.stringify(failed));
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting quote:", error?.message || error);
      return false;
    }
  }
}

export default new QuoteService();