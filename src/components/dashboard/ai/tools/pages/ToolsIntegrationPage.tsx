import { useMemo, useState } from "react";
import IconButton from "@/components/common/IconButton";
import { useAiStore } from "@/store/aiStore";
import { ToolTile, ToolTileSkeleton } from "../comman/ToolTile";
import { TOOLS_LIST } from "@/services/ai/tools/data/toolsList";
import { Tool, ToolCatalog, ToolPayload, ToolStatus } from "@/types/Tool";
import { ToolConnectDialog } from "./ToolConnectDialog";
import { useTools } from "@/hooks/tools/useTools";
import { useToolMutation } from "@/hooks/tools/useToolMutation";
import { ConfirmDialog } from "@/components/common/dialog/ConfirmDialog";

export default function ToolsIntegrationPage() {
  const { setSelectedAiMenu } = useAiStore();

  // ✅ fetch saved tools from backend
  const { tools, setTools, loading } = useTools();
  const { loading: updateToolLoading, isDeleteLoading, deleteTool, updateTool } = useToolMutation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"connect" | "edit">("connect");
  const [selectedTool, setSelectedTool] = useState<ToolCatalog | null>(null);

  const handleBack = () => setSelectedAiMenu(null);

  // ✅ Merge TOOL_LIST (catalog) with DB tools (saved)
  const mergedTools: ToolCatalog[] = useMemo(() => {
    return TOOLS_LIST.map((catalogTool) => {
      const saved = tools.find((t: Tool) => t.id === catalogTool.id);

      return {
        ...catalogTool,
        _id: saved?._id,
        status: saved?.status ?? catalogTool.status ?? ToolStatus.NOT_CONNECTED,
        active: saved?.active ?? false,
        // ✅ inject saved credential values into catalog credentials array
        credentials: catalogTool.credentials.map((cred) => ({
          ...cred,
          value: saved?.credentials?.[cred.key] ?? "",
        })),
      };
    });
  }, [tools]);

  const categories = useMemo(() => {
    const set = new Set(mergedTools.map((t) => t.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [mergedTools]);

  const filteredTools = useMemo(() => {
    return mergedTools.filter((tool) => {
      const matchesSearch =
        (tool.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (tool.desc ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || tool.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [mergedTools, search, category]);

  // ✅ Connect mode
  const handleConnect = (tool: ToolCatalog) => {
    setDialogMode("connect");
    setSelectedTool(tool);
    setOpenDialog(true);
  };

  // ✅ Edit mode (Manage)
  const handleManage = (tool: ToolCatalog) => {
    const saved = mergedTools.find((t: ToolCatalog) => t.id === tool.id);

    if (!saved?._id) {
      // if not found in DB, fallback to connect
      handleConnect(tool);
      return;
    }

    setDialogMode("edit");
    setSelectedTool(tool);
    setOpenDialog(true);
  };

  // ✅ Toggle active/inactive directly from tile
  const handleToggleActive = async (tool: ToolCatalog, active: boolean) => {
    const saved = mergedTools.find((t: ToolCatalog) => t.id === tool.id);
    if (!saved?._id) return;

    setSelectedTool(tool);

    const updatedTool: ToolPayload = { id: saved.id, active };
    const updated = await updateTool(saved._id, updatedTool);
    if (!updated) return;

    // ✅ update UI instantly
    setTools((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    setSelectedTool(null);
  };

  // ✅ Delete tool handler
  const deleteToolHandler = async () => {
    if (!selectedTool) return;
    const saved = mergedTools.find((t: ToolCatalog) => t.id === selectedTool.id);

    if (!saved?._id) return;

    const deleted = await deleteTool(saved._id);
    if (!deleted) return;
    // ✅ update UI instantly
    setTools((prev) => prev.filter((t) => t._id !== saved._id));
    setOpenDeleteDialog(false);
    setSelectedTool(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161717]">
      {/* Header */}
      <div className="p-5 flex items-center justify-between bg-white dark:bg-[#161717] border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handleBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tools Integrations
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[320px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1D1E1E] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/10"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-[200px] px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1D1E1E] text-gray-900 dark:text-white outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Action */}
          {/* <button
            className="px-4 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black font-medium hover:opacity-90 transition"
            onClick={() => alert("Add new tool (demo)")}
          >
            + Add Tool
          </button> */}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ToolTileSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Tools Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {filteredTools.map((tool) => (
              <ToolTile
                key={tool.id}
                tool={tool}
                onConnect={handleConnect}
                onManage={handleManage} // ✅ now opens edit dialog
                onToggleActive={handleToggleActive}
                onToggleLoading={(t) => selectedTool?.id === t.id && updateToolLoading}
                onDelete={(t) => {
                  setSelectedTool(t);
                  setOpenDeleteDialog(true);
                }}
                onDeleteLoading={(t) => selectedTool?.id === t.id && isDeleteLoading}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTools.length === 0 && (
          <div className="mt-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No tools found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try searching a different keyword or category.
            </p>
          </div>
        )}
      </div>

      {/* Connect / Edit Dialog */}
      <ToolConnectDialog
        open={openDialog}
        tool={selectedTool}
        mode={dialogMode}
        onClose={() => {
          setOpenDialog(false);
          setSelectedTool(null);
          setDialogMode("connect");

        }}
        onSuccess={(tool: Tool) => {
          setTools((prev) => { {
            const exists = prev.find((t) => t._id === tool._id);
            if (exists) {
              // update existing
              return prev.map((t) => (t._id === tool._id ? tool : t));
            }
            // add new
            return [...prev, tool];
          } });
        }}
      />
      <ConfirmDialog
        open={openDeleteDialog}
        loading={isDeleteLoading}
        title={`Delete ${selectedTool?.name || ""} tool?`}
        description="This action cannot be undone."
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={deleteToolHandler}
      />
    </div>
  );
}
