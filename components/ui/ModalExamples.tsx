"use client";

import { useState } from "react";
import { GoldModal, ConfirmationModal, FormModal, StandardModal, useConfirmationModal, useFormModal } from "./StandardModal";
import EntityButton from "../EntityButton";

export function ModalExamples() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);

  const { createDeleteConfirmation, createArchiveConfirmation, createAddConfirmation } = useConfirmationModal();
  const { createAddModal, createEditModal, createDeleteModal } = useFormModal();

  const handleDelete = () => {
    console.log("Delete confirmed");
  };

  const handleArchive = () => {
    console.log("Archive confirmed");
  };

  const handleAdd = () => {
    console.log("Add submitted");
  };

  const handleEdit = () => {
    console.log("Edit submitted");
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gold">Modal System Examples</h2>
      <p className="text-gray-300 mb-6">Notice how modal colors match the action button colors for consistent UX</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* Gold Modal - Positive Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Gold Modal (Positive)</h3>
          <EntityButton color="gold" onClick={() => setBasicOpen(true)}>
            Add Player
          </EntityButton>
          <GoldModal
            open={basicOpen}
            onOpenChange={setBasicOpen}
            title="Add New Player"
            description="This modal demonstrates gold styling for positive actions"
            variant="default"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-300">Gold border and title match the gold button.</p>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Form content would go here</p>
              </div>
            </div>
          </GoldModal>
        </div>

        {/* Red Modal - Danger Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Red Modal (Danger)</h3>
          <EntityButton color="danger" onClick={() => setDeleteOpen(true)}>
            Delete Player
          </EntityButton>
          <ConfirmationModal
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete Player"
            description="Are you sure you want to delete this player? This action cannot be undone."
            onConfirm={handleDelete}
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
          />
        </div>

        {/* Gray Modal - Archive Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Gray Modal (Archive)</h3>
          <EntityButton color="archive" onClick={() => setArchiveOpen(true)}>
            Archive Plan
          </EntityButton>
          <ConfirmationModal
            open={archiveOpen}
            onOpenChange={setArchiveOpen}
            title="Archive Development Plan"
            description="Are you sure you want to archive this plan? You can restore it later."
            onConfirm={handleArchive}
            confirmText="Archive"
            cancelText="Cancel"
            variant="archive"
          />
        </div>

        {/* Green Modal - Success Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Green Modal (Success)</h3>
          <EntityButton color="gold" onClick={() => setSuccessOpen(true)}>
            Confirm Success
          </EntityButton>
          <ConfirmationModal
            open={successOpen}
            onOpenChange={setSuccessOpen}
            title="Operation Successful"
            description="The operation completed successfully. Would you like to continue?"
            onConfirm={() => console.log("Success confirmed")}
            confirmText="Continue"
            cancelText="Close"
            variant="success"
          />
        </div>

        {/* Yellow Modal - Warning Actions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Yellow Modal (Warning)</h3>
          <EntityButton color="gold" onClick={() => setWarningOpen(true)}>
            Show Warning
          </EntityButton>
          <ConfirmationModal
            open={warningOpen}
            onOpenChange={setWarningOpen}
            title="Warning"
            description="This action may have unintended consequences. Are you sure you want to proceed?"
            onConfirm={() => console.log("Warning confirmed")}
            confirmText="Proceed"
            cancelText="Cancel"
            variant="warning"
          />
        </div>

        {/* Form Modal - Gold */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Form Modal (Gold)</h3>
          <EntityButton color="gold" onClick={() => setFormOpen(true)}>
            Edit Player
          </EntityButton>
          <FormModal
            open={formOpen}
            onOpenChange={setFormOpen}
            title="Edit Player"
            description="Update the player's information below"
            onSubmit={handleEdit}
            submitText="Save Changes"
            cancelText="Cancel"
            variant="default"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  placeholder="Enter position"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </FormModal>
        </div>

        {/* Standard Modal - Confirmation */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Standard Modal (Confirmation)</h3>
          <EntityButton color="danger" onClick={() => setDeleteOpen(true)}>
            Standard Delete
          </EntityButton>
          <StandardModal
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete Item"
            description="Are you sure you want to delete this item?"
            type="confirmation"
            onConfirm={handleDelete}
            variant="danger"
          />
        </div>

        {/* Standard Modal - Form */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Standard Modal (Form)</h3>
          <EntityButton color="gold" onClick={() => setFormOpen(true)}>
            Standard Form
          </EntityButton>
          <StandardModal
            open={formOpen}
            onOpenChange={setFormOpen}
            title="Add New Item"
            description="Enter the details below"
            type="form"
            onSubmit={handleAdd}
            submitText="Add Item"
            variant="default"
          >
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          </StandardModal>
        </div>

        {/* Convenience Hook - Delete */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Convenience Hook - Delete</h3>
          <EntityButton color="danger" onClick={() => setDeleteOpen(true)}>
            Delete with Hook
          </EntityButton>
          {createDeleteConfirmation(
            deleteOpen,
            setDeleteOpen,
            handleDelete,
            "test item"
          )}
        </div>

        {/* Convenience Hook - Archive */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Convenience Hook - Archive</h3>
          <EntityButton color="archive" onClick={() => setArchiveOpen(true)}>
            Archive with Hook
          </EntityButton>
          {createArchiveConfirmation(
            archiveOpen,
            setArchiveOpen,
            handleArchive,
            "development plan"
          )}
        </div>

        {/* Convenience Hook - Add */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Convenience Hook - Add</h3>
          <EntityButton color="gold" onClick={() => setAddOpen(true)}>
            Add with Hook
          </EntityButton>
          {createAddModal(
            addOpen,
            setAddOpen,
            handleAdd,
            "Add New Player",
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          )}
        </div>

        {/* Convenience Hook - Edit */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Convenience Hook - Edit</h3>
          <EntityButton color="gold" onClick={() => setEditOpen(true)}>
            Edit with Hook
          </EntityButton>
          {createEditModal(
            editOpen,
            setEditOpen,
            handleEdit,
            "Edit Player",
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                defaultValue="John"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <input
                type="text"
                placeholder="Last Name"
                defaultValue="Doe"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          )}
        </div>
      </div>

      {/* Color Matching Guide */}
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gold mb-4">Color Matching Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gold rounded"></div>
              <span className="text-white font-medium">Gold Button → Gold Modal</span>
            </div>
            <p className="text-gray-400">For add, edit, confirm actions</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-white font-medium">Red Button → Red Modal</span>
            </div>
            <p className="text-gray-400">For delete, remove, destructive actions</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-zinc-500 rounded"></div>
              <span className="text-white font-medium">Gray Button → Gray Modal</span>
            </div>
            <p className="text-gray-400">For archive, soft delete actions</p>
          </div>
        </div>
      </div>
    </div>
  );
} 