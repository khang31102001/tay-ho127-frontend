"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";
import { listArticleCategories, type ManagedArticleCategory } from "@/features/article-categories";
import { listArticleTags, type ManagedArticleTag } from "@/features/article-tags";
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
  isSlugTaken,
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
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ManagedArticleCategory[]>([]);
  const [tagOptions, setTagOptions] = useState<ManagedArticleTag[]>([]);
  const [seoSettings, setSeoSettings] = useState<ManagedSeoSettings | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | undefined>(undefined);

  // Tab "SEO" — xem ghi chú trong features/seo/hooks/useSeoMetadataForm.ts.
  const seo = useSeoMetadataForm("article", id);

  useEffect(() => {
    Promise.all([listMedia(), listArticleCategories(), listArticleTags()]).then(
      ([media, categories, tags]) => {
        setMediaOptions(media);
        setCategoryOptions(categories);
        setTagOptions(tags);
      },
    );
    getSeoSettings().then(setSeoSettings);
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getArticleById(id).then((article) => {
      if (isCancelled) {
        return;
      }

      if (article) {
        const { id: _articleId, createdAt: _createdAt, updatedAt: _updatedAt, publishedAt: _publishedAt, ...rest } = article;
        setForm(rest);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  useEffect(() => {
    if (!form.slug) {
      setIsSlugAvailable(undefined);
      return;
    }

    let isCancelled = false;

    isSlugTaken(form.slug, id).then((taken) => {
      if (!isCancelled) {
        setIsSlugAvailable(!taken);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [form.slug, id]);

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
    if (isSlugAvailable === false) {
      throw new Error("Slug đã được dùng cho bài viết khác.");
    }

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
    mediaOptions,
    categoryOptions,
    tagOptions,
    seo,
    seoSettings,
    isLoading: isLoading || (isEditMode && seo.isLoading),
    isEditMode,
    isSlugAvailable,
    /** Chỉ có khi đang sửa bài viết đã tồn tại — dùng để bật nút "Xem trước". */
    previewSlug: isEditMode ? form.slug : null,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
