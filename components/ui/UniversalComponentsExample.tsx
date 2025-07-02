import React, { useState } from "react";
import UniversalButton from "./UniversalButton";
import UniversalModal, { Modal } from "./UniversalModal";

export function UniversalComponentsExample() {
  const [modalStates, setModalStates] = useState({
    basic: false,
    confirm: false,
    form: false,
    delete: false,
    archive: false,
    success: false,
    warning: false,
    add: false,
    edit: false,
    info: false,
  });

  const handleModalChange = (modalName: keyof typeof modalStates) => (open: boolean) => {
    setModalStates(prev => ({ ...prev, [modalName]: open }));
  };

  const handleConfirm = () => {
    console.log("Action confirmed!");
  };

  const handleSubmit = () => {
    console.log("Form submitted!");
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#C2B56B] mb-8">Universal Components System</h1>
        
        {/* Button Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Universal Buttons</h2>
          
          {/* Primary Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Primary Buttons (Solid)</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Primary onClick={() => console.log("Primary clicked")}>
                Primary Gold
              </UniversalButton.Primary>
              
              <UniversalButton.Danger onClick={() => console.log("Danger clicked")}>
                Danger Red
              </UniversalButton.Danger>
              
              <UniversalButton.Success onClick={() => console.log("Success clicked")}>
                Success Green
              </UniversalButton.Success>
              
              <UniversalButton.Warning onClick={() => console.log("Warning clicked")}>
                Warning Yellow
              </UniversalButton.Warning>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Secondary Buttons (Outline)</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Secondary onClick={() => console.log("Secondary clicked")}>
                Secondary Gold
              </UniversalButton.Secondary>
              
              <UniversalButton.DangerOutline onClick={() => console.log("Danger outline clicked")}>
                Danger Outline
              </UniversalButton.DangerOutline>
              
              <UniversalButton.Archive onClick={() => console.log("Archive clicked")}>
                Archive Gray
              </UniversalButton.Archive>
              
              <UniversalButton.Gray onClick={() => console.log("Gray clicked")}>
                Gray Neutral
              </UniversalButton.Gray>
            </div>
          </div>

          {/* Text and Ghost Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Text & Ghost Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Text onClick={() => console.log("Text clicked")}>
                Text Button
              </UniversalButton.Text>
              
              <UniversalButton.Ghost onClick={() => console.log("Ghost clicked")}>
                Ghost Button
              </UniversalButton.Ghost>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <UniversalButton.Primary size="xs">Extra Small</UniversalButton.Primary>
              <UniversalButton.Primary size="sm">Small</UniversalButton.Primary>
              <UniversalButton.Primary size="md">Medium</UniversalButton.Primary>
              <UniversalButton.Primary size="lg">Large</UniversalButton.Primary>
              <UniversalButton.Primary size="xl">Extra Large</UniversalButton.Primary>
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Loading States</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Primary loading>Loading...</UniversalButton.Primary>
              <UniversalButton.Danger loading>Deleting...</UniversalButton.Danger>
              <UniversalButton.Success loading>Saving...</UniversalButton.Success>
            </div>
          </div>
        </section>

        {/* Modal Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Universal Modals</h2>
          
          {/* Basic Modals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Basic Modals</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Primary onClick={() => setModalStates(prev => ({ ...prev, basic: true }))}>
                Open Basic Modal
              </UniversalButton.Primary>
              
              <UniversalButton.Secondary onClick={() => setModalStates(prev => ({ ...prev, info: true }))}>
                Open Info Modal
              </UniversalButton.Secondary>
            </div>
          </div>

          {/* Confirmation Modals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Confirmation Modals</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Danger onClick={() => setModalStates(prev => ({ ...prev, delete: true }))}>
                Delete Confirmation
              </UniversalButton.Danger>
              
              <UniversalButton.Archive onClick={() => setModalStates(prev => ({ ...prev, archive: true }))}>
                Archive Confirmation
              </UniversalButton.Archive>
              
              <UniversalButton.Success onClick={() => setModalStates(prev => ({ ...prev, success: true }))}>
                Success Confirmation
              </UniversalButton.Success>
              
              <UniversalButton.Warning onClick={() => setModalStates(prev => ({ ...prev, warning: true }))}>
                Warning Confirmation
              </UniversalButton.Warning>
            </div>
          </div>

          {/* Form Modals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Form Modals</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Primary onClick={() => setModalStates(prev => ({ ...prev, add: true }))}>
                Add Form Modal
              </UniversalButton.Primary>
              
              <UniversalButton.Secondary onClick={() => setModalStates(prev => ({ ...prev, edit: true }))}>
                Edit Form Modal
              </UniversalButton.Secondary>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Usage Examples</h2>
          
          <div className="bg-zinc-800 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Common Patterns</h3>
            
            <div className="space-y-2">
              <h4 className="text-md font-medium text-zinc-400">Delete Pattern:</h4>
              <div className="flex items-center gap-4">
                <UniversalButton.Danger size="sm" onClick={() => setModalStates(prev => ({ ...prev, delete: true }))}>
                  Delete Player
                </UniversalButton.Danger>
                <span className="text-zinc-500 text-sm">→ Opens red confirmation modal</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-md font-medium text-zinc-400">Add Pattern:</h4>
              <div className="flex items-center gap-4">
                <UniversalButton.Primary size="sm" onClick={() => setModalStates(prev => ({ ...prev, add: true }))}>
                  Add Player
                </UniversalButton.Primary>
                <span className="text-zinc-500 text-sm">→ Opens gold form modal</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-md font-medium text-zinc-400">Archive Pattern:</h4>
              <div className="flex items-center gap-4">
                <UniversalButton.Archive size="sm" onClick={() => setModalStates(prev => ({ ...prev, archive: true }))}>
                  Archive Plan
                </UniversalButton.Archive>
                <span className="text-zinc-500 text-sm">→ Opens gray confirmation modal</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Instances */}
      
      {/* Basic Modal */}
      <UniversalModal.Basic
        open={modalStates.basic}
        onOpenChange={handleModalChange('basic')}
        title="Basic Modal"
        description="This is a basic modal for displaying content."
        variant="default"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">This modal demonstrates the basic content display functionality.</p>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-400">Content area with custom styling</p>
          </div>
        </div>
      </UniversalModal.Basic>

      {/* Info Modal */}
      <Modal.Info
        open={modalStates.info}
        onOpenChange={handleModalChange('info')}
        title="Information Modal"
        description="This modal displays informational content."
        variant="default"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">This is an informational modal with larger size.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800 p-3 rounded">
              <p className="text-sm text-zinc-400">Column 1</p>
            </div>
            <div className="bg-zinc-800 p-3 rounded">
              <p className="text-sm text-zinc-400">Column 2</p>
            </div>
          </div>
        </div>
      </Modal.Info>

      {/* Delete Modal */}
      <Modal.Delete
        open={modalStates.delete}
        onOpenChange={handleModalChange('delete')}
        title="Delete Player"
        description="Are you sure you want to delete John Doe? This action cannot be undone."
        onConfirm={handleConfirm}
        confirmText="Delete Player"
        loading={false}
      />

      {/* Archive Modal */}
      <Modal.Archive
        open={modalStates.archive}
        onOpenChange={handleModalChange('archive')}
        title="Archive Development Plan"
        description="Are you sure you want to archive this plan? You can restore it later."
        onConfirm={handleConfirm}
        confirmText="Archive Plan"
        loading={false}
      />

      {/* Success Modal */}
      <Modal.Success
        open={modalStates.success}
        onOpenChange={handleModalChange('success')}
        title="Operation Successful"
        description="The player has been successfully added to your team."
        onConfirm={handleConfirm}
        confirmText="Continue"
        loading={false}
      />

      {/* Warning Modal */}
      <Modal.Warning
        open={modalStates.warning}
        onOpenChange={handleModalChange('warning')}
        title="Warning"
        description="This action will affect all players in the team. Are you sure you want to proceed?"
        onConfirm={handleConfirm}
        confirmText="Proceed"
        loading={false}
      />

      {/* Add Form Modal */}
      <Modal.Add
        open={modalStates.add}
        onOpenChange={handleModalChange('add')}
        title="Add New Player"
        description="Enter the player's information below."
        onSubmit={handleSubmit}
        submitText="Add Player"
        loading={false}
        disabled={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">First Name</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Last Name</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300"
              placeholder="Enter last name"
            />
          </div>
        </div>
      </Modal.Add>

      {/* Edit Form Modal */}
      <Modal.Edit
        open={modalStates.edit}
        onOpenChange={handleModalChange('edit')}
        title="Edit Player"
        description="Update the player's information below."
        onSubmit={handleSubmit}
        submitText="Save Changes"
        loading={false}
        disabled={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">First Name</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300"
              defaultValue="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Last Name</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300"
              defaultValue="Doe"
            />
          </div>
        </div>
      </Modal.Edit>
    </div>
  );
}

export default UniversalComponentsExample; 