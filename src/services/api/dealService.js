class DealService {
  constructor() {
    this.tableName = 'deal_c';
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch deals:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error?.message || error);
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.message || error);
      return null;
    }
  }

  async create(dealData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: dealData.title_c || dealData.title,
          title_c: dealData.title_c || dealData.title,
          value_c: Number(dealData.value_c || dealData.value || 0),
          stage_c: dealData.stage_c || dealData.stage || "lead",
          probability_c: Number(dealData.probability_c || dealData.probability || 10),
          expected_close_date_c: dealData.expected_close_date_c || dealData.expectedCloseDate || null,
          description_c: dealData.description_c || dealData.description || "",
contact_id_c: dealData.contact_id_c || dealData.contactId ? parseInt(dealData.contact_id_c || dealData.contactId) : null,
          created_at_c: new Date().toISOString()
        }]
      };

      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create deal:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating deal:", error?.message || error);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: dealData.title_c || dealData.title,
          title_c: dealData.title_c || dealData.title,
          value_c: Number(dealData.value_c || dealData.value || 0),
          stage_c: dealData.stage_c || dealData.stage,
          probability_c: Number(dealData.probability_c || dealData.probability || 10),
          expected_close_date_c: dealData.expected_close_date_c || dealData.expectedCloseDate || null,
          description_c: dealData.description_c || dealData.description || "",
contact_id_c: dealData.contact_id_c || dealData.contactId ? parseInt(dealData.contact_id_c || dealData.contactId) : null
        }]
      };

      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update deal:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating deal:", error?.message || error);
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
        console.error("Failed to delete deal:", response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, JSON.stringify(failed));
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting deal:", error?.message || error);
      return false;
    }
  }
}

export default new DealService();