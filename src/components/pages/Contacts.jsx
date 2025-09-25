import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ContactForm from "@/components/organisms/ContactForm";
import ApperIcon from "@/components/ApperIcon";
import contactService from "@/services/api/contactService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
      console.error("Contacts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (contactData) => {
    try {
      const newContact = await contactService.create(contactData);
      setContacts(prev => [newContact, ...prev]);
    } catch (error) {
      throw new Error("Failed to create contact");
    }
  };

  const handleUpdateContact = async (contactData) => {
    try {
const updatedContact = await contactService.update(selectedContact.Id, contactData);
      setContacts(prev => prev.map(contact => 
        contact.Id === updatedContact.Id ? updatedContact : contact
      ));
    } catch (error) {
      throw new Error("Failed to update contact");
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await contactService.delete(contactId);
      setContacts(prev => prev.filter(contact => contact.Id !== contactId));
      toast.success("Contact deleted successfully!");
      setIsDetailOpen(false);
    } catch (error) {
      toast.error("Failed to delete contact. Please try again.");
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
(contact.first_name_c || contact.firstName || "").toLowerCase().includes(searchLower) ||
      (contact.last_name_c || contact.lastName || "").toLowerCase().includes(searchLower) ||
      (contact.email_c || contact.email || "").toLowerCase().includes(searchLower) ||
      (contact.company_c || contact.company || "").toLowerCase().includes(searchLower)
    );
  });

  const openCreateForm = () => {
    setSelectedContact(null);
    setIsFormOpen(true);
  };

  const openEditForm = (contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const openContactDetail = (contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setIsDetailOpen(false);
    setSelectedContact(null);
  };

  if (loading) {
    return <Loading type="table" className="p-6" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-secondary mt-1">Manage your customer relationships</p>
        </div>
        <Button variant="primary" onClick={openCreateForm} className="inline-flex items-center">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contacts..."
          className="max-w-md"
        />
      </div>

      {filteredContacts.length === 0 ? (
        <Empty
          title="No contacts found"
          description={searchTerm ? "No contacts match your search criteria" : "Get started by adding your first contact"}
          icon="Users"
          actionLabel={!searchTerm ? "Add Contact" : undefined}
          onAction={!searchTerm ? openCreateForm : undefined}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.Id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
{(contact.first_name_c || contact.firstName || "?")[0]}{(contact.last_name_c || contact.lastName || "?")[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
{contact.first_name_c || contact.firstName} {contact.last_name_c || contact.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{contact.company_c || contact.company}</div>
                      <div className="text-sm text-gray-500">{contact.position_c || contact.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{contact.email_c || contact.email}</div>
                      <div className="text-sm text-gray-500">{contact.phone_c || contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
{format(new Date(contact.last_activity_c || contact.lastActivity || contact.CreatedOn), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openContactDetail(contact)}
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(contact)}
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.Id)}
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

      {/* Contact Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeModal}
        title={selectedContact ? "Edit Contact" : "Add New Contact"}
        size="lg"
      >
        <ContactForm
          contact={selectedContact}
          onSave={selectedContact ? handleUpdateContact : handleCreateContact}
          onCancel={closeModal}
        />
      </Modal>

      {/* Contact Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={closeModal}
        title="Contact Details"
        size="lg"
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
{(selectedContact.first_name_c || selectedContact.firstName || "?")[0]}{(selectedContact.last_name_c || selectedContact.lastName || "?")[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
{selectedContact.first_name_c || selectedContact.firstName} {selectedContact.last_name_c || selectedContact.lastName}
                  </h3>
                  <p className="text-secondary">{selectedContact.position_c || selectedContact.position} at {selectedContact.company_c || selectedContact.company}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditForm(selectedContact)}
                >
                  <ApperIcon name="Edit2" className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteContact(selectedContact.Id)}
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <Card.Header>
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                </Card.Header>
                <Card.Content className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Mail" className="w-4 h-4 text-gray-400" />
<span className="text-sm text-gray-900">{selectedContact.email_c || selectedContact.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Phone" className="w-4 h-4 text-gray-400" />
<span className="text-sm text-gray-900">{selectedContact.phone_c || selectedContact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Building" className="w-4 h-4 text-gray-400" />
<span className="text-sm text-gray-900">{selectedContact.company_c || selectedContact.company}</span>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Header>
                  <h4 className="font-semibold text-gray-900">Timeline</h4>
                </Card.Header>
                <Card.Content className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">
{format(new Date(selectedContact.created_at_c || selectedContact.createdAt || selectedContact.CreatedOn), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Activity</span>
                    <span className="text-gray-900">
                      {format(new Date(selectedContact.lastActivity), "MMM dd, yyyy")}
                    </span>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contacts;