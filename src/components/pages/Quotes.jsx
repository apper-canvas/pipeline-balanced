import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import QuoteForm from "@/components/organisms/QuoteForm";
import ApperIcon from "@/components/ApperIcon";
import quoteService from "@/services/api/quoteService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    loadQuotesData();
  }, []);

  const loadQuotesData = async () => {
    try {
      setLoading(true);
      setError("");
      const [quotesData, contactsData, dealsData] = await Promise.all([
        quoteService.getAll(),
        contactService.getAll(),
        dealService.getAll(),
      ]);
      setQuotes(quotesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load quotes. Please try again.");
      console.error("Quotes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async (quoteData) => {
    try {
      const newQuote = await quoteService.create(quoteData);
      if (newQuote) {
        await loadQuotesData();
        toast.success("Quote created successfully!");
      }
    } catch (error) {
      toast.error("Failed to create quote. Please try again.");
      console.error("Create quote error:", error);
    }
  };

  const handleUpdateQuote = async (quoteData) => {
    try {
      const updatedQuote = await quoteService.update(selectedQuote.Id, quoteData);
      if (updatedQuote) {
        await loadQuotesData();
        toast.success("Quote updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update quote. Please try again.");
      console.error("Update quote error:", error);
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm("Are you sure you want to delete this quote?")) {
      return;
    }

    try {
      const success = await quoteService.delete(quoteId);
      if (success) {
        await loadQuotesData();
        toast.success("Quote deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete quote. Please try again.");
      console.error("Delete quote error:", error);
    }
  };

  const openCreateForm = () => {
    setSelectedQuote(null);
    setIsFormOpen(true);
  };

  const openEditForm = (quote) => {
    setSelectedQuote(quote);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedQuote(null);
  };

  const getContactName = (contactId) => {
    if (!contactId) return "N/A";
    if (typeof contactId === 'object') {
      return contactId.Name || `${contactId.first_name_c || ''} ${contactId.last_name_c || ''}`.trim() || "N/A";
    }
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.first_name_c || ''} ${contact.last_name_c || ''}`.trim() || "N/A" : "N/A";
  };

  const getDealName = (dealId) => {
    if (!dealId) return "N/A";
    if (typeof dealId === 'object') {
      return dealId.Name || dealId.title_c || "N/A";
    }
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.title_c || deal.Name || "N/A" : "N/A";
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Draft": return "bg-gray-100 text-gray-800";
      case "Sent": return "bg-blue-100 text-blue-800";
      case "Accepted": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.company_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.status_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getContactName(quote.contact_id_c).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadQuotesData} />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-secondary mt-1">Manage your sales quotes</p>
        </div>
        <Button variant="primary" onClick={openCreateForm} className="inline-flex items-center">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Quote
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search quotes..."
          className="max-w-md"
        />
      </div>

      {filteredQuotes.length === 0 ? (
        <Empty
          title="No quotes found"
          description={searchTerm ? "No quotes match your search criteria" : "Get started by creating your first quote"}
          icon="File"
          actionLabel={!searchTerm ? "Add Quote" : undefined}
          onAction={!searchTerm ? openCreateForm : undefined}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.Id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                          <ApperIcon name="File" className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {quote.Name || `Quote ${quote.Id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote.delivery_method_c && `via ${quote.delivery_method_c}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quote.company_c || "N/A"}</div>
                      <div className="text-sm text-gray-500">{getContactName(quote.contact_id_c)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDealName(quote.deal_id_c)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(quote.status_c)}`}>
                        {quote.status_c || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.quote_date_c ? format(new Date(quote.quote_date_c), "MMM dd, yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.expires_on_c ? format(new Date(quote.expires_on_c), "MMM dd, yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(quote)}
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuote(quote.Id)}
                          className="text-error hover:text-error"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeModal}
        title={selectedQuote ? "Edit Quote" : "Add New Quote"}
        size="xl"
      >
        <QuoteForm
          quote={selectedQuote}
          onSave={selectedQuote ? handleUpdateQuote : handleCreateQuote}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Quotes;