import { z } from 'zod';

export const ID_PATTERN = /^[A-Za-z0-9_-]{6,21}$/;

export const Id = z.string().regex(ID_PATTERN);

/** Single-line plain text. Rendered as text, never as HTML. */
export const Text = (max = 200) => z.string().max(max);

/**
 * Sanitized HTML limited to: p, br, strong, em, u, a[href http/https/mailto], ul, li.
 * The server re-sanitizes every value of this type.
 */
export const RichText = z.string().max(20000);

/** "YYYY" | "YYYY-MM" | null. */
export const PartialDate = z
    .string()
    .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/)
    .nullable();

/**
 * http(s)/mailto, or anything without a scheme ("linkedin.com/in/x", or a
 * half-typed "linked"), so autosave never rejects partial input. Other
 * schemes (javascript:, data:, …) are refused.
 */
export const Url = z
    .string()
    .max(500)
    .regex(
        /^(https?:\/\/|mailto:)\S*$|^(?![A-Za-z][A-Za-z0-9+.-]*:)[^\s<>"]*$/,
    );

export const Column = z.enum(['main', 'side']);

/** Cropped WebP/JPEG/PNG data URI, up to ~200 KB of image data. */
export const PhotoSrc = z
    .string()
    .max(280_000)
    .regex(/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/);

export const Keywords = z.array(Text(60)).max(30);

export type Id = z.infer<typeof Id>;
export type RichText = z.infer<typeof RichText>;
export type PartialDate = z.infer<typeof PartialDate>;
export type Column = z.infer<typeof Column>;
