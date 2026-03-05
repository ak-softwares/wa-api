"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import IconButton from "@/components/common/IconButton";
import { useTemplateStore } from "@/store/templateStore";
import { TemplateCategory, TemplateComponentType, TemplateHeaderType } from "@/utiles/enums/template";
import MessagePreviewPage from "../../messages/pages/MessagePreviewPage";
import { MessageType, MessageStatus } from "@/types/MessageType";
import { Message } from "@/types/Message";
import { YOUTUBE_VIDEOS } from "@/utiles/constans/youtubeHelp";
import { YouTubeHelpButton } from "@/components/common/iframe/youTubeEmbedIframe";
import { useTemplateEditor } from "@/hooks/template/useTemplateEditor";
import { useTemplateMediaUpload } from "@/hooks/template/useTemplateMediaUpload";
import { useTemplateMutation } from "@/hooks/template/useTemplateMutation";
import { TemplateInfoSection } from "../editor/sections/TemplateInfoSection";
import { TemplateHeaderSection } from "../editor/sections/TemplateHeaderSection";
import { TemplateBodySection } from "../editor/sections/TemplateBodySection";
import { TemplateFooterSection } from "../editor/sections/TemplateFooterSection";
import { TemplateButtonsSection } from "../editor/sections/TemplateButtonsSection";

export default function CreateTemplatePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const { duplicateTemplateData, setDuplicateTemplateData, setEditTemplateData, editTemplateData, setSelectedTemplateMenu } = useTemplateStore();
  const { isUploading, uploadTemplateMedia } = useTemplateMediaUpload();
  const { mutateTemplate } = useTemplateMutation();

  const editor = useTemplateEditor();

  useEffect(() => {
    if (!editTemplateData) return;
    setIsEdit(true);
    editor.hydrateFromTemplate(editTemplateData, { includeId: true });
    setEditTemplateData(null);
  }, [editTemplateData, editor, setEditTemplateData]);

  useEffect(() => {
    if (!duplicateTemplateData) return;
    setIsEdit(false);
    editor.hydrateFromTemplate(duplicateTemplateData, { copyName: true });
    setDuplicateTemplateData(null);
  }, [duplicateTemplateData, editor, setDuplicateTemplateData]);

  useEffect(() => {
    if ([TemplateHeaderType.TEXT, TemplateHeaderType.LOCATION].includes(editor.headerFormat)) {
      editor.clearMedia();
    }
  }, [editor.headerFormat]);

  const handleChooseMedia = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadResult = await uploadTemplateMedia(file, editor.headerFormat);
      editor.setMedia({
        file,
        fileName: file.name,
        previewUrl: uploadResult.previewUrl,
        headerHandle: uploadResult.headerHandle,
      });
      showToast.success("Media uploaded successfully");
    } catch (error: any) {
      showToast.error(error.message || "Failed to upload media");
    } finally {
      e.target.value = "";
    }
  };

  const fullMessage: Message = {
    _id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    chatId: crypto.randomUUID(),
    to: "91826XXXXXX",
    from: "81399XXXXX",
    status: MessageStatus.Delivered,
    type: MessageType.TEMPLATE,
    createdAt: new Date().toISOString(),
    template: {
      _id: crypto.randomUUID(),
      id: editor.templateId || "temp_preview",
      userId: crypto.randomUUID(),
      waAccountId: crypto.randomUUID(),
      name: editor.templateName || "Untitled Template",
      category: editor.templateCategory,
      language: editor.templateLanguage,
      components: [
        {
          type: TemplateComponentType.HEADER,
          format: editor.headerFormat,
          text: editor.headerFormat === TemplateHeaderType.TEXT ? editor.headerText : undefined,
          example: editor.headerFormat !== TemplateHeaderType.TEXT && editor.headerMedia.previewUrl
            ? { header_handle: [editor.headerMedia.previewUrl] }
            : /\{\{\d+\}\}/.test(editor.headerText)
            ? { header_text: [editor.headerSampleValues] }
            : undefined,
        },
        {
          type: TemplateComponentType.BODY,
          text: editor.bodyText || "",
          example: /\{\{\d+\}\}/.test(editor.bodyText) ? { body_text: [editor.bodySampleValues] } : undefined,
        },
        editor.footerText ? { type: TemplateComponentType.FOOTER, text: editor.footerText } : null,
        editor.buttons.filter((btn) => btn.text?.trim()).length > 0
          ? { type: TemplateComponentType.BUTTONS, buttons: editor.buttons }
          : null,
      ].filter(Boolean) as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  const saveTemplate = async () => {
    try {
      setIsSaving(true);

      if (!editor.templateName.trim()) {
        showToast.error("Template name is required");
        return;
      }

      if (editor.templateCategory !== TemplateCategory.AUTHENTICATION && !editor.bodyText.trim()) {
        showToast.error("Body text is required");
        return;
      }

      if ([TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(editor.headerFormat) && !editor.headerMedia.headerHandle) {
        showToast.error(`Please upload a ${editor.headerFormat.toLowerCase()} for the header`);
        return;
      }

      const data = await mutateTemplate({
        isEdit,
        payload: {
          id: editor.templateId,
          name: editor.templateName,
          category: editor.templateCategory,
          language: editor.templateLanguage,
          components: editor.buildComponents(),
        },
      });

      if (!data.success) {
        showToast.error(data.message || "Failed to save template");
        return;
      }

      showToast.success(data.message);
      editor.resetForm();
      setSelectedTemplateMenu(null);
      router.refresh();
    } catch (error: any) {
      showToast.error("Something went wrong " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton onClick={() => setSelectedTemplateMenu(null)} label="Back" IconSrc="/assets/icons/arrow-left.svg" />
          <h1 className="text-xl font-semibold">{`${isEdit ? "Edit" : "Add"} Template`}</h1>
        </div>
        <YouTubeHelpButton videoId={YOUTUBE_VIDEOS.broadcast.videoId} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="flex-6 space-y-6">
          <TemplateInfoSection
            templateCategory={editor.templateCategory}
            setTemplateCategory={editor.setTemplateCategory}
            templateLanguage={editor.templateLanguage}
            setTemplateLanguage={editor.setTemplateLanguage}
            templateName={editor.templateName}
            setTemplateName={editor.setTemplateName}
            toMetaTemplateName={editor.toMetaTemplateName}
          />

          {editor.templateCategory !== TemplateCategory.AUTHENTICATION && (
            <TemplateHeaderSection
              headerFormat={editor.headerFormat}
              setHeaderFormat={editor.setHeaderFormat}
              headerText={editor.headerText}
              setHeaderText={editor.setHeaderText}
              addVariableInHeader={editor.addVariableInHeader}
              headerSampleValues={editor.headerSampleValues}
              setHeaderSampleValues={editor.setHeaderSampleValues}
              headerVariables={/\{\{\d+\}\}/.test(editor.headerText)}
              headerMedia={editor.headerMedia}
              onChooseMedia={handleChooseMedia}
              clearMedia={editor.clearMedia}
              isUploading={isUploading}
              getAcceptedFileTypes={editor.getAcceptedFileTypes}
            />
          )}

          {editor.templateCategory !== TemplateCategory.AUTHENTICATION && (
            <TemplateBodySection
              bodyText={editor.bodyText}
              handleBodyTextChange={editor.handleBodyTextChange}
              addVariableInBody={editor.addVariableInBody}
              bodyVariables={editor.bodyVariables}
              bodySampleValues={editor.bodySampleValues}
              setBodySampleValues={editor.setBodySampleValues}
            />
          )}

          {editor.templateCategory !== TemplateCategory.AUTHENTICATION && (
            <TemplateFooterSection footerText={editor.footerText} setFooterText={editor.setFooterText} />
          )}

          {editor.templateCategory !== TemplateCategory.AUTHENTICATION && (
            <TemplateButtonsSection
              buttons={editor.buttons}
              updateButton={editor.updateButton}
              removeButton={editor.removeButton}
              addButton={editor.addButton}
              isVariableAddedInButtonUrl={editor.isVariableAddedInButtonUrl}
              addVariableInUrlButton={editor.addVariableInUrlButton}
              removeVariableInUrlButton={editor.removeVariableInUrlButton}
              setUrlSampleValues={editor.setUrlSampleValues}
              setCopyCodeSampleValues={editor.setCopyCodeSampleValues}
            />
          )}

          <Button onClick={saveTemplate} disabled={isSaving} className="w-full mt-4 mb-10">
            {isSaving ? (isEdit ? "Updating Template..." : "Creating Template...") : isEdit ? "Update Template" : "Create Template"}
          </Button>
        </div>

        <div className="flex-3 w-full md:w-[360px] self-start sticky top-10">
          <MessagePreviewPage messages={[fullMessage]} />
        </div>
      </div>
    </div>
  );
}