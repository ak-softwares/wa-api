"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, FileText, MessageSquare, Image, File, CheckCircle, XCircle, MoreVertical } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  components: {
    type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
    text?: string;
    format?: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
    buttons?: {
      type: "QUICK_REPLY" | "PHONE_NUMBER" | "URL";
      text: string;
      url?: string;
      phone_number?: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function TemplateManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: "",
    category: "UTILITY",
    language: "en",
    components: [
      { type: "BODY", text: "" }
    ]
  });

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "order_confirmation",
      category: "UTILITY",
      language: "en",
      status: "APPROVED",
      components: [
        { type: "HEADER", text: "Order Confirmation", format: "TEXT" },
        { type: "BODY", text: "Hello {{1}}, your order #{{2}} has been confirmed. It will be delivered by {{3}}." },
        { type: "FOOTER", text: "Thank you for shopping with us!" },
        { 
          type: "BUTTONS", 
          buttons: [
            { type: "QUICK_REPLY", text: "Track Order" },
            { type: "QUICK_REPLY", text: "Contact Support" }
          ]
        }
      ],
      createdAt: "2023-05-10",
      updatedAt: "2023-05-10"
    },
    {
      id: "2",
      name: "welcome_message",
      category: "MARKETING",
      language: "en",
      status: "APPROVED",
      components: [
        { type: "HEADER", format: "IMAGE" },
        { type: "BODY", text: "Welcome {{1}} to our service! We're excited to have you on board." },
        { type: "FOOTER", text: "Get started with our app today!" },
        { 
          type: "BUTTONS", 
          buttons: [
            { type: "URL", text: "Visit Website", url: "https://example.com" },
            { type: "QUICK_REPLY", text: "Get Started" }
          ]
        }
      ],
      createdAt: "2023-04-15",
      updatedAt: "2023-04-15"
    },
    {
      id: "3",
      name: "appointment_reminder",
      category: "UTILITY",
      language: "en",
      status: "PENDING",
      components: [
        { type: "BODY", text: "Reminder: Your appointment with {{1}} is scheduled for {{2}} at {{3}}." },
        { 
          type: "BUTTONS", 
          buttons: [
            { type: "QUICK_REPLY", text: "Confirm" },
            { type: "QUICK_REPLY", text: "Reschedule" }
          ]
        }
      ],
      createdAt: "2023-06-20",
      updatedAt: "2023-06-20"
    },
    {
      id: "4",
      name: "verification_code",
      category: "AUTHENTICATION",
      language: "en",
      status: "APPROVED",
      components: [
        { type: "BODY", text: "Your verification code is {{1}}. It will expire in 10 minutes." }
      ],
      createdAt: "2023-03-05",
      updatedAt: "2023-03-05"
    },
    {
      id: "5",
      name: "promotional_offer",
      category: "MARKETING",
      language: "en",
      status: "REJECTED",
      components: [
        { type: "HEADER", text: "Special Offer!", format: "TEXT" },
        { type: "BODY", text: "Hi {{1}}, we have a special offer just for you! Get {{2}} off on your next purchase." },
        { type: "FOOTER", text: "Offer valid until {{3}}" },
        { 
          type: "BUTTONS", 
          buttons: [
            { type: "URL", text: "Shop Now", url: "https://example.com/shop" }
          ]
        }
      ],
      createdAt: "2023-07-12",
      updatedAt: "2023-07-15"
    }
  ]);

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.components?.[0]?.text) return;
    
    const templateToAdd: Template = {
      ...newTemplate as Template,
      id: Date.now().toString(),
      status: "PENDING",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setTemplates([...templates, templateToAdd]);
    setNewTemplate({
      name: "",
      category: "UTILITY",
      language: "en",
      components: [
        { type: "BODY", text: "" }
      ]
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditTemplate = () => {
    if (!currentTemplate) return;
    
    setTemplates(templates.map(template => 
      template.id === currentTemplate.id ? {
        ...currentTemplate,
        updatedAt: new Date().toISOString().split('T')[0]
      } : template
    ));
    setIsEditDialogOpen(false);
    setCurrentTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MARKETING":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "UTILITY":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "AUTHENTICATION":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const addComponent = (type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS") => {
    setNewTemplate(prev => ({
      ...prev,
      components: [
        ...(prev.components || []),
        { type }
      ]
    }));
  };

  const removeComponent = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      components: (prev.components || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">WhatsApp Template Management</h1>
          <p className="text-gray-500">Create and manage your WhatsApp message templates</p>
        </div>

        {/* Actions Bar */}
        <Card className="p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search templates..."
              className="pl-10 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      placeholder="Enter template name"
                      value={newTemplate.name || ""}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value: "MARKETING" | "UTILITY" | "AUTHENTICATION") => 
                        setNewTemplate({...newTemplate, category: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="UTILITY">Utility</SelectItem>
                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select
                    value={newTemplate.language}
                    onValueChange={(value) => setNewTemplate({...newTemplate, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Components</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addComponent("HEADER")}>
                        Add Header
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addComponent("FOOTER")}>
                        Add Footer
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addComponent("BUTTONS")}>
                        Add Buttons
                      </Button>
                    </div>
                  </div>
                  
                  {newTemplate.components?.map((component, index) => (
                    <div key={index} className="border rounded-md p-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeComponent(index)}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                      
                      <div className="mb-2">
                        <Badge variant="outline" className="mb-2">
                          {component.type}
                        </Badge>
                      </div>
                      
                      {component.type === "HEADER" && (
                        <div className="space-y-2">
                          <Select
                            value={component.format || "TEXT"}
                            onValueChange={(value) => {
                              const updatedComponents = [...(newTemplate.components || [])];
                              updatedComponents[index] = {
                                ...updatedComponents[index],
                                format: value as "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO"
                              };
                              setNewTemplate({...newTemplate, components: updatedComponents});
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Header format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TEXT">Text</SelectItem>
                              <SelectItem value="IMAGE">Image</SelectItem>
                              <SelectItem value="DOCUMENT">Document</SelectItem>
                              <SelectItem value="VIDEO">Video</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {component.format === "TEXT" && (
                            <Input
                              placeholder="Header text"
                              value={component.text || ""}
                              onChange={(e) => {
                                const updatedComponents = [...(newTemplate.components || [])];
                                updatedComponents[index] = {
                                  ...updatedComponents[index],
                                  text: e.target.value
                                };
                                setNewTemplate({...newTemplate, components: updatedComponents});
                              }}
                            />
                          )}
                        </div>
                      )}
                      
                      {(component.type === "BODY" || component.type === "FOOTER") && (
                        <Textarea
                          placeholder={`Enter ${component.type.toLowerCase()} text`}
                          value={component.text || ""}
                          onChange={(e) => {
                            const updatedComponents = [...(newTemplate.components || [])];
                            updatedComponents[index] = {
                              ...updatedComponents[index],
                              text: e.target.value
                            };
                            setNewTemplate({...newTemplate, components: updatedComponents});
                          }}
                        />
                      )}
                      
                      {component.type === "BUTTONS" && (
                        <div className="space-y-3">
                          {component.buttons?.map((button, btnIndex) => (
                            <div key={btnIndex} className="flex gap-2 items-center">
                              <Select
                                value={button.type}
                                onValueChange={(value: "QUICK_REPLY" | "PHONE_NUMBER" | "URL") => {
                                  const updatedComponents = [...(newTemplate.components || [])];
                                  const updatedButtons = [...(updatedComponents[index].buttons || [])];
                                  updatedButtons[btnIndex] = {
                                    ...updatedButtons[btnIndex],
                                    type: value
                                  };
                                  updatedComponents[index] = {
                                    ...updatedComponents[index],
                                    buttons: updatedButtons
                                  };
                                  setNewTemplate({...newTemplate, components: updatedComponents});
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                  <SelectItem value="PHONE_NUMBER">Call</SelectItem>
                                  <SelectItem value="URL">URL</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Input
                                placeholder="Button text"
                                value={button.text}
                                onChange={(e) => {
                                  const updatedComponents = [...(newTemplate.components || [])];
                                  const updatedButtons = [...(updatedComponents[index].buttons || [])];
                                  updatedButtons[btnIndex] = {
                                    ...updatedButtons[btnIndex],
                                    text: e.target.value
                                  };
                                  updatedComponents[index] = {
                                    ...updatedComponents[index],
                                    buttons: updatedButtons
                                  };
                                  setNewTemplate({...newTemplate, components: updatedComponents});
                                }}
                              />
                              
                              {(button.type === "URL" || button.type === "PHONE_NUMBER") && (
                                <Input
                                  placeholder={button.type === "URL" ? "URL" : "Phone number"}
                                  value={button.type === "URL" ? button.url || "" : button.phone_number || ""}
                                  onChange={(e) => {
                                    const updatedComponents = [...(newTemplate.components || [])];
                                    const updatedButtons = [...(updatedComponents[index].buttons || [])];
                                    updatedButtons[btnIndex] = {
                                      ...updatedButtons[btnIndex],
                                      [button.type === "URL" ? "url" : "phone_number"]: e.target.value
                                    };
                                    updatedComponents[index] = {
                                      ...updatedComponents[index],
                                      buttons: updatedButtons
                                    };
                                    setNewTemplate({...newTemplate, components: updatedComponents});
                                  }}
                                />
                              )}
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const updatedComponents = [...(newTemplate.components || [])];
                                  const updatedButtons = updatedComponents[index].buttons?.filter((_, i) => i !== btnIndex) || [];
                                  updatedComponents[index] = {
                                    ...updatedComponents[index],
                                    buttons: updatedButtons
                                  };
                                  setNewTemplate({...newTemplate, components: updatedComponents});
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedComponents = [...(newTemplate.components || [])];
                              if (!updatedComponents[index].buttons) {
                                updatedComponents[index].buttons = [];
                              }
                              updatedComponents[index].buttons?.push({
                                type: "QUICK_REPLY",
                                text: ""
                              });
                              setNewTemplate({...newTemplate, components: updatedComponents});
                            }}
                          >
                            Add Button
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center">
                  {getCategoryIcon(template.category)}
                  <h3 className="font-semibold ml-2">{template.name}</h3>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(template.status)}
                  <Badge 
                    className="ml-2" 
                    variant={
                      template.status === "APPROVED" ? "default" : 
                      template.status === "PENDING" ? "secondary" : "destructive"
                    }
                  >
                    {template.status}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>Category: {template.category}</span>
                  <span>Language: {template.language}</span>
                </div>
                
                <div className="mb-4">
                  {template.components.find(c => c.type === "BODY") && (
                    <div className="text-sm mb-2 line-clamp-2">
                      {template.components.find(c => c.type === "BODY")?.text}
                    </div>
                  )}
                  
                  {template.components.find(c => c.type === "HEADER") && (
                    <div className="text-xs font-medium flex items-center mb-1">
                      <FileText className="h-3 w-3 mr-1" />
                      Header: {template.components.find(c => c.type === "HEADER")?.format}
                    </div>
                  )}
                  
                  {template.components.find(c => c.type === "BUTTONS") && (
                    <div className="text-xs font-medium flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Buttons: {template.components.find(c => c.type === "BUTTONS")?.buttons?.length}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Created: {template.createdAt}</span>
                  <span>Updated: {template.updatedAt}</span>
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-end gap-2">
                <Dialog open={isEditDialogOpen && currentTemplate?.id === template.id} onOpenChange={setIsEditDialogOpen}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentTemplate(template);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Dialog>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No templates found</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm ? "Try a different search term" : "Create your first template to get started"}
            </p>
          </div>
        )}

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
            </DialogHeader>
            {currentTemplate && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      placeholder="Enter template name"
                      value={currentTemplate.name}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={currentTemplate.category}
                      onValueChange={(value: "MARKETING" | "UTILITY" | "AUTHENTICATION") => 
                        setCurrentTemplate({...currentTemplate, category: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="UTILITY">Utility</SelectItem>
                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select
                    value={currentTemplate.language}
                    onValueChange={(value) => setCurrentTemplate({...currentTemplate, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4 pt-4">
                  <h3 className="font-medium">Components</h3>
                  
                  {currentTemplate.components.map((component, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="mb-2">
                        <Badge variant="outline" className="mb-2">
                          {component.type}
                        </Badge>
                      </div>
                      
                      {component.type === "HEADER" && (
                        <div className="space-y-2">
                          <Select
                            value={component.format || "TEXT"}
                            onValueChange={(value) => {
                              const updatedComponents = [...currentTemplate.components];
                              updatedComponents[index] = {
                                ...updatedComponents[index],
                                format: value as "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO"
                              };
                              setCurrentTemplate({...currentTemplate, components: updatedComponents});
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Header format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TEXT">Text</SelectItem>
                              <SelectItem value="IMAGE">Image</SelectItem>
                              <SelectItem value="DOCUMENT">Document</SelectItem>
                              <SelectItem value="VIDEO">Video</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {component.format === "TEXT" && (
                            <Input
                              placeholder="Header text"
                              value={component.text || ""}
                              onChange={(e) => {
                                const updatedComponents = [...currentTemplate.components];
                                updatedComponents[index] = {
                                  ...updatedComponents[index],
                                  text: e.target.value
                                };
                                setCurrentTemplate({...currentTemplate, components: updatedComponents});
                              }}
                            />
                          )}
                        </div>
                      )}
                      
                      {(component.type === "BODY" || component.type === "FOOTER") && (
                        <Textarea
                          placeholder={`Enter ${component.type.toLowerCase()} text`}
                          value={component.text || ""}
                          onChange={(e) => {
                            const updatedComponents = [...currentTemplate.components];
                            updatedComponents[index] = {
                              ...updatedComponents[index],
                              text: e.target.value
                            };
                            setCurrentTemplate({...currentTemplate, components: updatedComponents});
                          }}
                        />
                      )}
                      
                      {component.type === "BUTTONS" && (
                        <div className="space-y-3">
                          {component.buttons?.map((button, btnIndex) => (
                            <div key={btnIndex} className="flex gap-2 items-center">
                              <Select
                                value={button.type}
                                onValueChange={(value: "QUICK_REPLY" | "PHONE_NUMBER" | "URL") => {
                                  const updatedComponents = [...currentTemplate.components];
                                  const updatedButtons = [...(updatedComponents[index].buttons || [])];
                                  updatedButtons[btnIndex] = {
                                    ...updatedButtons[btnIndex],
                                    type: value
                                  };
                                  updatedComponents[index] = {
                                    ...updatedComponents[index],
                                    buttons: updatedButtons
                                  };
                                  setCurrentTemplate({...currentTemplate, components: updatedComponents});
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                  <SelectItem value="PHONE_NUMBER">Call</SelectItem>
                                  <SelectItem value="URL">URL</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Input
                                placeholder="Button text"
                                value={button.text}
                                onChange={(e) => {
                                  const updatedComponents = [...currentTemplate.components];
                                  const updatedButtons = [...(updatedComponents[index].buttons || [])];
                                  updatedButtons[btnIndex] = {
                                    ...updatedButtons[btnIndex],
                                    text: e.target.value
                                  };
                                  updatedComponents[index] = {
                                    ...updatedComponents[index],
                                    buttons: updatedButtons
                                  };
                                  setCurrentTemplate({...currentTemplate, components: updatedComponents});
                                }}
                              />
                              
                              {(button.type === "URL" || button.type === "PHONE_NUMBER") && (
                                <Input
                                  placeholder={button.type === "URL" ? "URL" : "Phone number"}
                                  value={button.type === "URL" ? button.url || "" : button.phone_number || ""}
                                  onChange={(e) => {
                                    const updatedComponents = [...currentTemplate.components];
                                    const updatedButtons = [...(updatedComponents[index].buttons || [])];
                                    updatedButtons[btnIndex] = {
                                      ...updatedButtons[btnIndex],
                                      [button.type === "URL" ? "url" : "phone_number"]: e.target.value
                                    };
                                    updatedComponents[index] = {
                                      ...updatedComponents[index],
                                      buttons: updatedButtons
                                    };
                                    setCurrentTemplate({...currentTemplate, components: updatedComponents});
                                  }}
                                />
                              )}
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const updatedComponents = [...currentTemplate.components];
                                  const updatedButtons = updatedComponents[index].buttons?.filter((_, i) => i !== btnIndex) || [];
                                  updatedComponents[index] = {
                                    ...updatedComponents[index],
                                    buttons: updatedButtons
                                  };
                                  setCurrentTemplate({...currentTemplate, components: updatedComponents});
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedComponents = [...currentTemplate.components];
                              if (!updatedComponents[index].buttons) {
                                updatedComponents[index].buttons = [];
                              }
                              updatedComponents[index].buttons?.push({
                                type: "QUICK_REPLY",
                                text: ""
                              });
                              setCurrentTemplate({...currentTemplate, components: updatedComponents});
                            }}
                          >
                            Add Button
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditTemplate}>
                    Update Template
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}