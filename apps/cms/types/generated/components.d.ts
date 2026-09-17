import type { Schema, Struct } from '@strapi/strapi';

export interface OrderItem extends Struct.ComponentSchema {
  collectionName: 'components_order_items';
  info: {
    description: '\u041E\u0434\u0438\u043D \u0442\u043E\u0432\u0430\u0440 \u0443 \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u0456: \u043D\u0430\u0437\u0432\u0430, \u043E\u0431\u0440\u0430\u043D\u0456 \u0432\u0430\u0440\u0456\u0430\u043D\u0442\u0438, \u043A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0456 \u0446\u0456\u043D\u0430 \u043D\u0430 \u043C\u043E\u043C\u0435\u043D\u0442 \u043A\u0443\u043F\u0456\u0432\u043B\u0456.';
    displayName: '\u041F\u043E\u0437\u0438\u0446\u0456\u044F \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F';
    icon: 'shoppingCart';
  };
  attributes: {
    options: Schema.Attribute.String;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    productName: Schema.Attribute.String & Schema.Attribute.Required;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    unitPrice: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface ProductSubValue extends Struct.ComponentSchema {
  collectionName: 'components_product_sub_values';
  info: {
    description: '\u0412\u0430\u0440\u0456\u0430\u043D\u0442 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0440\u0456\u0432\u043D\u044F, \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u043B\u0438\u0448\u0435 \u0434\u043B\u044F \u0441\u0432\u043E\u0433\u043E \u0431\u0430\u0442\u044C\u043A\u0456\u0432\u0441\u044C\u043A\u043E\u0433\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F. \u041D\u0430\u043F\u0440. \u0454\u043C\u043D\u0456\u0441\u0442\u044C \u00AB40 ml\u00BB, \u044F\u043A\u0430 \u0456\u0441\u043D\u0443\u0454 \u0442\u0456\u043B\u044C\u043A\u0438 \u0434\u043B\u044F \u0442\u0438\u043F\u0443 \u0448\u043A\u0456\u0440\u0438 \u00ABDry\u00BB.';
    displayName: '\u0412\u043A\u043B\u0430\u0434\u0435\u043D\u0438\u0439 \u0432\u0430\u0440\u0456\u0430\u043D\u0442';
    icon: 'tag';
  };
  attributes: {
    discountedPrice: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    discountPercent: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    priceOverride: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    stock: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface ProductVariation extends Struct.ComponentSchema {
  collectionName: 'components_product_variations';
  info: {
    description: '\u0413\u0440\u0443\u043F\u0430 \u0432\u0430\u0440\u0456\u0430\u043D\u0442\u0456\u0432 \u0442\u043E\u0432\u0430\u0440\u0443: \u00ABSize\u00BB \u0437 \u0454\u043C\u043D\u043E\u0441\u0442\u044F\u043C\u0438 30/50/100 ml, \u00ABSkin type\u00BB \u0437 Dry/Normal/Sensitive. \u0414\u043E\u0434\u0430\u0439\u0442\u0435 \u0441\u043A\u0456\u043B\u044C\u043A\u0438 \u0433\u0440\u0443\u043F \u043F\u043E\u0442\u0440\u0456\u0431\u043D\u043E, \u0430\u0431\u043E \u0436\u043E\u0434\u043D\u043E\u0457.';
    displayName: '\u0412\u0430\u0440\u0456\u0430\u0446\u0456\u044F';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    values: Schema.Attribute.Component<'product.variation-value', true>;
  };
}

export interface ProductVariationValue extends Struct.ComponentSchema {
  collectionName: 'components_product_variation_values';
  info: {
    description: '\u041E\u0434\u0438\u043D \u0432\u0430\u0440\u0456\u0430\u043D\u0442 \u0433\u0440\u0443\u043F\u0438, \u043D\u0430\u043F\u0440. \u00ABDry\u00BB \u0443 \u0433\u0440\u0443\u043F\u0456 \u00ABSkin type\u00BB. \u042F\u043A\u0449\u043E \u0446\u0435\u0439 \u0432\u0430\u0440\u0456\u0430\u043D\u0442 \u0456\u0441\u043D\u0443\u0454 \u043B\u0438\u0448\u0435 \u0432 \u043F\u0435\u0432\u043D\u0438\u0445 \u0454\u043C\u043D\u043E\u0441\u0442\u044F\u0445 \u2014 \u0434\u043E\u0434\u0430\u0439\u0442\u0435 \u0457\u0445 \u0443 \u00AB\u0412\u043A\u043B\u0430\u0434\u0435\u043D\u0456 \u0432\u0430\u0440\u0456\u0430\u043D\u0442\u0438\u00BB \u043D\u0438\u0436\u0447\u0435.';
    displayName: '\u0417\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0432\u0430\u0440\u0456\u0430\u0446\u0456\u0457';
    icon: 'tag';
  };
  attributes: {
    discountedPrice: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    discountPercent: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    priceOverride: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    stock: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    subLabel: Schema.Attribute.String;
    subValues: Schema.Attribute.Component<'product.sub-value', true>;
  };
}

export interface SharedAnnouncementMessage extends Struct.ComponentSchema {
  collectionName: 'components_shared_announcement_messages';
  info: {
    description: '\u041E\u0434\u043D\u0435 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u0443 \u0441\u043C\u0443\u0437\u0456 \u043E\u0433\u043E\u043B\u043E\u0448\u0435\u043D\u044C \u0443\u0433\u043E\u0440\u0456 \u0441\u0430\u0439\u0442\u0443.';
    displayName: '\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F';
    icon: 'bell';
  };
  attributes: {
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'order.item': OrderItem;
      'product.sub-value': ProductSubValue;
      'product.variation': ProductVariation;
      'product.variation-value': ProductVariationValue;
      'shared.announcement-message': SharedAnnouncementMessage;
    }
  }
}
