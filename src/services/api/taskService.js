class TaskService {
  constructor() {
    this.tableName = 'task_c';
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
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch tasks:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.message || error);
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
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };

      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.message || error);
      return null;
    }
  }

  async create(taskData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: taskData.title_c || taskData.title,
          title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description || "",
          due_date_c: taskData.due_date_c || taskData.dueDate,
          priority_c: taskData.priority_c || taskData.priority || "medium",
          status_c: taskData.status_c || taskData.status || "pending",
          contact_id_c: taskData.contact_id_c || taskData.contactId || null,
          deal_id_c: taskData.deal_id_c || taskData.dealId || null
        }]
      };

      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create task:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating task:", error?.message || error);
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskData.title_c || taskData.title,
          title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description || "",
          due_date_c: taskData.due_date_c || taskData.dueDate,
          priority_c: taskData.priority_c || taskData.priority,
          status_c: taskData.status_c || taskData.status,
          contact_id_c: taskData.contact_id_c || taskData.contactId || null,
          deal_id_c: taskData.deal_id_c || taskData.dealId || null
        }]
      };

      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update task:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating task:", error?.message || error);
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
        console.error("Failed to delete task:", response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:`, JSON.stringify(failed));
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting task:", error?.message || error);
      return false;
    }
  }
}

export default new TaskService();