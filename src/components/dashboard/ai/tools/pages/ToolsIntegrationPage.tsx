import { useMemo, useState } from "react";
import IconButton from "@/components/common/IconButton";
import { useAiStore } from "@/store/aiStore";
import { ToolTile, ToolTileSkeleton } from "../comman/ToolTile";
import { Tool, ToolCatalog, ToolPayload, ToolStatus } from "@/types/Tool";
import { ToolConnectDialog } from "./ToolConnectDialog";
import { useTools } from "@/hooks/tools/useTools";
import { useEditTool } from "@/hooks/tools/useEditTool";
import { ConfirmDialog } from "@/components/common/dialog/ConfirmDialog";

export default function ToolsIntegrationPage() {
  const { setSelectedAiMenu } = useAiStore();
  const { tools, setTools, loading, hasMore, loadingMore, loadMore } = useTools();
  const { loading: updateToolLoading, isDeleteLoading, deleteTool, updateTool } = useEditTool();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"connect" | "edit">("connect");
  const [selectedTool, setSelectedTool] = useState<ToolCatalog | null>(null);

  const handleBack = () => setSelectedAiMenu(null);

  const categories = useMemo(() => {
    const set = new Set(tools.map((t) => t.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        (tool.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (tool.desc ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || tool.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [tools, search, category]);

  const handleConnect = (tool: ToolCatalog) => {
    setDialogMode("connect");
    setSelectedTool(tool);
    setOpenDialog(true);
  };

  const handleManage = (tool: ToolCatalog) => {
    if (!tool?._id) {
      handleConnect(tool);
      return;
    }

    setDialogMode("edit");
    setSelectedTool(tool);
    setOpenDialog(true);
  };

  const handleToggleActive = async (tool: ToolCatalog, active: boolean) => {
    if (!tool?._id) return;

    setSelectedTool(tool);

    const updatedTool: ToolPayload = { id: tool.id, active };
    const updated = await updateTool(tool._id, updatedTool);
    if (!updated) return;

    setTools((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              ...t,
              _id: updated._id,
              active: updated.active,
              status: updated.status,
              createdAt: updated.createdAt,
              updatedAt: updated.updatedAt,
              credentials: t.credentials.map((cred) => ({
                ...cred,
                value: updated.credentials?.[cred.key] ?? cred.value ?? "",
              })),
            }
          : t
      )
    );
    setSelectedTool(null);
  };

  const deleteToolHandler = async () => {
    if (!selectedTool?._id) return;

    const deleted = await deleteTool(selectedTool._id);
    if (!deleted) return;

    setTools((prev) =>
      prev.map((tool) => {
        if (tool.id !== selectedTool.id) return tool;

        return {
          ...tool,
          _id: undefined,
          active: false,
          status: ToolStatus.NOT_CONNECTED,
          createdAt: undefined,
          updatedAt: undefined,
          credentials: tool.credentials.map((cred) => ({
            ...cred,
            value: "",
          })),
        };
      })
    );

    setOpenDeleteDialog(false);
    setSelectedTool(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161717]">
      <div className="p-5 flex items-center justify-between bg-white dark:bg-[#161717] border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <IconButton onClick={handleBack} label="Back" IconSrc="/assets/icons/arrow-left.svg" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Tools Integrations</h1>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1D1E1E] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/10"
              />
            </div>

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
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ToolTileSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {filteredTools.map((tool) => (
              <ToolTile
                key={tool.id}
                tool={tool}
                onConnect={handleConnect}
                onManage={handleManage}
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

        {!loading && filteredTools.length === 0 && (
          <div className="mt-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No tools found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try searching a different keyword or category.</p>
          </div>
        )}

        {!loading && hasMore && search.trim() === "" && category === "All" && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      <ToolConnectDialog
        open={openDialog}
        tool={selectedTool}
        mode={dialogMode}
        onClose={() => {
          setOpenDialog(false);
          setSelectedTool(null);
          setDialogMode("connect");
        }}
        onSuccess={(savedTool: Tool) => {
          setTools((prev) =>
            prev.map((tool) => {
              if (tool.id !== savedTool.id) return tool;

              return {
                ...tool,
                _id: savedTool._id,
                active: savedTool.active,
                status: savedTool.status,
                createdAt: savedTool.createdAt,
                updatedAt: savedTool.updatedAt,
                credentials: tool.credentials.map((cred) => ({
                  ...cred,
                  value: savedTool.credentials?.[cred.key] ?? "",
                })),
              };
            })
          );
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