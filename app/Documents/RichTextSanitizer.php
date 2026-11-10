<?php

namespace App\Documents;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * Cleans rich text down to the tags the editor produces:
 * p, br, strong, em, u, ul, li and a[href] with http, https or mailto.
 */
class RichTextSanitizer
{
    private HtmlSanitizer $sanitizer;

    public function __construct()
    {
        $config = (new HtmlSanitizerConfig)
            ->allowElement('p')
            ->allowElement('br')
            ->allowElement('strong')
            ->allowElement('em')
            ->allowElement('u')
            ->allowElement('ul')
            ->allowElement('li')
            ->allowElement('a', ['href'])
            ->allowLinkSchemes(['http', 'https', 'mailto'])
            ->allowRelativeLinks(false)
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->withMaxInputLength(40000);

        // Keep the text of wrappers that pasted content tends to bring along.
        foreach (['div', 'span', 'b', 'i', 'font', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'blockquote'] as $element) {
            $config = $config->blockElement($element);
        }

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function sanitize(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        return $this->sanitizer->sanitizeFor('body', $html);
    }
}
