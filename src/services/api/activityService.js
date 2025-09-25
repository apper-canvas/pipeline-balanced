class ActivityService {
  constructor() {
    this.tableName = 'activity_c';
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch activities:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error?.message || error);
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
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
      console.error(`Error fetching activity ${id}:`, error?.message || error);
      return null;
    }
  }

  async create(activityData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: activityData.subject_c || activityData.subject,
          type_c: activityData.type_c || activityData.type || "call",
          subject_c: activityData.subject_c || activityData.subject,
          description_c: activityData.description_c || activityData.description || "",
          contact_id_c: activityData.contact_id_c || activityData.contactId || null,
          deal_id_c: activityData.deal_id_c || activityData.dealId || null,
          created_at_c: new Date().toISOString()
        }]
      };

      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create activity:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating activity:", error?.message || error);
      throw error;
    }
  }

  async update(id, activityData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: activityData.subject_c || activityData.subject,
          type_c: activityData.type_c || activityData.type,
          subject_c: activityData.subject_c || activityData.subject,
          description_c: activityData.description_c || activityData.description || "",
          contact_id_c: activityData.contact_id_c || activityData.contactId || null,
          deal_id_c: activityData.deal_id_c || activityData.dealId || null
        }]
      };

      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update activity:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} activities:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating activity:", error?.message || error);
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
        console.error("Failed to delete activity:", response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} activities:`, JSON.stringify(failed));
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting activity:", error?.message || error);
      return false;
    }
  }
}

export default new ActivityService();