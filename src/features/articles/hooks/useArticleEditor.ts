"use client";

import { useEffect, useState } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { listMedia } from "@/features/media";
import { listArticleCategories } from "@/features/article-categories";
import { listArticleTags } from "@/features/article-tags";
import {
  getSeoSettings,
  isSeoFormEmpty,
  upsertSeoMetadata,
  useSeoMetadataForm,
  type ManagedSeoSettings,
} from "@/features/seo";

import type { ArticleUpsertInput } from "../services/article.service";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  updateArticle,
} from "../services/article.service";

export type ArticleFormValue = ArticleUpsertInput;

const EMPTY_FORM: ArticleFormValue = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  featuredMediaId: null,
  categoryId: null,
  tagIds: [],
  authorName: "",
  status: "draft",
};

type UseArticleEditorParams = {
  id?: string;
};

export function useArticleEditor({ id }: UseArticleEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ArticleFormValue>(EMPTY_FORM);
  const [seoSettings, setSeoSettings] = useState<ManagedSeoSettings | null>(null);

  const options = useAsyncData(
    () => Promise.all([listMedia(), listArticleCategories(), listArticleTags()]),
    [],
    { fallbackError: "Không thể tải media, danh mục và thẻ." },
  );
  const existing = useAsyncData(() => getArticleById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải bài viết.",
  });

  // Tab "SEO" — xem ghi chú trong features/seo/hooks/useSeoMetadataForm.ts.
  const seo = useSeoMetadataForm("article", id);

  useEffect(() => {
    getSeoSettings().then(setSeoSettings);
  }, []);

  useEffect(() => {
    if (!existing.data) return;

    const { id: _articleId, createdAt: _createdAt, updatedAt: _updatedAt, publishedAt: _publishedAt, ...rest } = existing.data;
    setForm(rest);
  }, [existing.data]);

  function updateField<K extends keyof ArticleFormValue>(field: K, value: ArticleFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleTag(tagId: string) {
    setForm((previous) => {
      const hasTag = previous.tagIds.includes(tagId);

      return {
        ...previous,
        tagIds: hasTag
          ? previous.tagIds.filter((item) => item !== tagId)
          : [...previous.tagIds, tagId],
      };
    });
  }

  async function handleSave() {
    if (isEditMode) {
      await updateArticle(id, form);
      await seo.save();
    } else {
      const created = await createArticle(form);

      if (!isSeoFormEmpty(seo.form)) {
        await upsertSeoMetadata("article", created.id, seo.form);
      }
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteArticle(id);
    }
  }

  function goToExplore() {
    router.push("/admin/content/articles");
  }

  return {
    form,
    updateField,
    toggleTag,
    mediaOptions: options.data?.[0] ?? [],
    categoryOptions: options.data?.[1] ?? [],
    tagOptions: options.data?.[2] ?? [],
    seo,
    seoSettings,
    isLoading: existing.isLoading || (isEditMode && seo.isLoading),
    loadError: existing.error ?? options.error,
    isEditMode,
    /** Chỉ có khi đang sửa bài viết đã tồn tại — dùng để bật nút "Xem trước". */
    previewSlug: isEditMode ? form.slug : null,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
