import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'shopify-store': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'store-domain'?: string;
        'public-access-token'?: string;
        country?: string;
        language?: string;
      }, HTMLElement>;
      'shopify-cart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string;
      }, HTMLElement>;
      'shopify-context': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type?: string;
        handle?: string;
        id?: string;
      }, HTMLElement>;
      'shopify-money': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        query?: string;
        format?: string;
      }, HTMLElement>;
      'shopify-media': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        query?: string;
        width?: string | number;
        height?: string | number;
      }, HTMLElement>;
      'shopify-data': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        query?: string;
      }, HTMLElement>;
      'shopify-variant-selector': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
