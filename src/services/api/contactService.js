class ContactService {
  constructor() {
    this.tableName = 'contact_c';
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
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_activity_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch contacts:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching contacts:", error?.message || error);
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
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_activity_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.message || error);
      return null;
    }
  }

  async create(contactData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: `${contactData.first_name_c || contactData.firstName} ${contactData.last_name_c || contactData.lastName}`,
          first_name_c: contactData.first_name_c || contactData.firstName,
          last_name_c: contactData.last_name_c || contactData.lastName,
          email_c: contactData.email_c || contactData.email,
          phone_c: contactData.phone_c || contactData.phone,
          company_c: contactData.company_c || contactData.company || "",
          position_c: contactData.position_c || contactData.position || "",
          created_at_c: new Date().toISOString(),
          last_activity_c: new Date().toISOString()
        }]
      };

      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create contact:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating contact:", error?.message || error);
      throw error;
    }
  }

  async update(id, contactData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${contactData.first_name_c || contactData.firstName} ${contactData.last_name_c || contactData.lastName}`,
          first_name_c: contactData.first_name_c || contactData.firstName,
          last_name_c: contactData.last_name_c || contactData.lastName,
          email_c: contactData.email_c || contactData.email,
          phone_c: contactData.phone_c || contactData.phone,
          company_c: contactData.company_c || contactData.company || "",
          position_c: contactData.position_c || contactData.position || ""
        }]
      };

      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update contact:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating contact:", error?.message || error);
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
        console.error("Failed to delete contact:", response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} contacts:`, JSON.stringify(failed));
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting contact:", error?.message || error);
      return false;
    }
}
}

export default new ContactService();