import React, { useState } from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const PipelineBoard = ({ deals, contacts, onEditDeal, onDeleteDeal }) => {
  const [draggedDeal, setDraggedDeal] = useState(null);

  const stages = [
    { id: "lead", name: "Lead", color: "bg-gray-100" },
    { id: "qualified", name: "Qualified", color: "bg-blue-100" },
    { id: "proposal", name: "Proposal", color: "bg-yellow-100" },
    { id: "negotiation", name: "Negotiation", color: "bg-orange-100" },
    { id: "closed-won", name: "Closed Won", color: "bg-green-100" },
    { id: "closed-lost", name: "Closed Lost", color: "bg-red-100" },
  ];

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

const getContact = (contactId) => {
    return contacts.find(contact => contact.Id === parseInt(contactId));
  };

  const getPriorityColor = (probability) => {
    if (probability >= 75) return "success";
    if (probability >= 50) return "warning";
    if (probability >= 25) return "info";
    return "default";
  };

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== stageId) {
const updatedDeal = { ...draggedDeal, stage_c: stageId };
      onEditDeal(updatedDeal);
    }
    setDraggedDeal(null);
  };

const DealCard = ({ deal }) => {
    const contact = getContact(deal.contact_id_c || deal.contactId);
    
    return (
      <Card 
        className="mb-3 cursor-move hover:shadow-md transition-all duration-200"
        draggable
        onDragStart={(e) => handleDragStart(e, deal)}
      >
        <Card.Content className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">{deal.title}</h4>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditDeal(deal)}
                className="p-1 h-auto"
              >
                <ApperIcon name="Edit2" className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteDeal(deal.Id)}
                className="p-1 h-auto text-error hover:text-error"
              >
                <ApperIcon name="Trash2" className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
<div className="text-lg font-bold text-primary mb-2">
            ${(deal.value_c || deal.value || 0).toLocaleString()}
          </div>
          
          <div className="space-y-2">
{contact && (
              <div className="flex items-center text-xs text-gray-600">
                <ApperIcon name="User" className="h-3 w-3 mr-1" />
                {contact.first_name_c || contact.firstName} {contact.last_name_c || contact.lastName}
              </div>
            )}
            
            <div className="flex items-center justify-between">
<Badge variant={getPriorityColor(deal.probability_c || deal.probability)}>
                {deal.probability_c || deal.probability}%
              </Badge>
              
{(deal.expected_close_date_c || deal.expectedCloseDate) && (
                <span className="text-xs text-gray-500">
                  {format(new Date(deal.expected_close_date_c || deal.expectedCloseDate), "MMM dd")}
                </span>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {stages.map(stage => {
        const stageDeals = getDealsByStage(stage.id);
        const stageValue = stageDeals.reduce((total, deal) => total + (deal.value || 0), 0);
        
        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className={`rounded-lg p-4 mb-4 ${stage.color}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <Badge variant="default">{stageDeals.length}</Badge>
              </div>
              <div className="text-sm font-medium text-gray-700">
                ${stageValue.toLocaleString()}
              </div>
            </div>
            
            <div className="space-y-3 min-h-[400px]">
              {stageDeals.map(deal => (
                <DealCard key={deal.Id} deal={deal} />
              ))}
              
              {stageDeals.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ApperIcon name="Package" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No deals in this stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineBoard;