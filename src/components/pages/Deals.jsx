import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import DealForm from "@/components/organisms/DealForm";
import PipelineBoard from "@/components/organisms/PipelineBoard";
import ApperIcon from "@/components/ApperIcon";
import dealService from "@/services/api/dealService";
import contactService from "@/services/api/contactService";
import { toast } from "react-toastify";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadDealsData();
  }, []);

  const loadDealsData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals. Please try again.");
      console.error("Deals error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (dealData) => {
    try {
      const newDeal = await dealService.create(dealData);
      setDeals(prev => [newDeal, ...prev]);
    } catch (error) {
      throw new Error("Failed to create deal");
    }
  };

  const handleUpdateDeal = async (dealData) => {
    try {
      let dealToUpdate = selectedDeal;
      let dealId = selectedDeal?.Id;

      // Handle both form updates and pipeline drag updates
      if (!selectedDeal && dealData.Id) {
        dealToUpdate = dealData;
        dealId = dealData.Id;
}

      const updatedDeal = await dealService.update(dealId, dealData);
      setDeals(prev => prev.map(deal => 
        deal.Id === updatedDeal.Id ? updatedDeal : deal
      ));
      
      if (selectedDeal) {
        toast.success("Deal updated successfully!");
      }
    } catch (error) {
      if (selectedDeal) {
        throw new Error("Failed to update deal");
      } else {
        toast.error("Failed to update deal stage. Please try again.");
      }
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      await dealService.delete(dealId);
      setDeals(prev => prev.filter(deal => deal.Id !== dealId));
      toast.success("Deal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete deal. Please try again.");
    }
  };

  const filteredDeals = deals.filter(deal => {
    const searchLower = searchTerm.toLowerCase();
const contact = contacts.find(c => c.Id === parseInt(deal.contact_id_c || deal.contactId));
    
    return (
(deal.title_c || deal.title || "").toLowerCase().includes(searchLower) ||
      (contact && `${contact.first_name_c || contact.firstName} ${contact.last_name_c || contact.lastName}`.toLowerCase().includes(searchLower)) ||
      (contact && (contact.company_c || contact.company || "").toLowerCase().includes(searchLower))
    );
  });

  const openCreateForm = () => {
    setSelectedDeal(null);
    setIsFormOpen(true);
  };

  const openEditForm = (deal) => {
    setSelectedDeal(deal);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedDeal(null);
  };

  if (loading) {
    return <Loading type="pipeline" className="p-6" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDealsData} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-secondary mt-1">Track your sales opportunities</p>
        </div>
        <Button variant="primary" onClick={openCreateForm} className="inline-flex items-center">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search deals..."
          className="max-w-md"
        />
      </div>

      {filteredDeals.length === 0 ? (
        <Empty
          title="No deals found"
          description={searchTerm ? "No deals match your search criteria" : "Get started by creating your first deal"}
          icon="TrendingUp"
          actionLabel={!searchTerm ? "Add Deal" : undefined}
          onAction={!searchTerm ? openCreateForm : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
          <PipelineBoard
            deals={filteredDeals}
            contacts={contacts}
            onEditDeal={handleUpdateDeal}
            onDeleteDeal={handleDeleteDeal}
          />
        </div>
      )}

      {/* Deal Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeModal}
        title={selectedDeal ? "Edit Deal" : "Add New Deal"}
        size="lg"
      >
        <DealForm
          deal={selectedDeal}
          onSave={selectedDeal ? handleUpdateDeal : handleCreateDeal}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Deals;