export enum PhotoCategory {
  CEFALO = 'Cefalo',
  NATURE = 'Nature',
  CITYSCAPE = 'Cityscape'
}

export function extractCategoryFromCaption(caption: string): string {
  if (!caption) {
    return PhotoCategory.NATURE; 
  }

  const parts = caption.split('_');
  if (parts.length >= 1) {
    const firstPart = parts[0].toLowerCase().trim();
    
    if (firstPart.includes('cefalo')) {
      return PhotoCategory.CEFALO;
    }
    if (firstPart.includes('nature')) {
      return PhotoCategory.NATURE;
    }
    if (firstPart.includes('cityscape') || firstPart.includes('city')) {
      return PhotoCategory.CITYSCAPE;
    }
  }

  const cleanCaption = caption.toLowerCase();

  const cefaloMatches = (cleanCaption.match(/cefalo|cefa|cefaloo|ceflo/g) || []).length;
  const natureMatches = (cleanCaption.match(/nature|natura|naturae|naturelle|natu|natur/g) || []).length;
  const cityscapeMatches = (cleanCaption.match(/cityscape|city|cityscapes/g) || []).length;

  if (cefaloMatches > natureMatches && cefaloMatches > cityscapeMatches) {
    return PhotoCategory.CEFALO;
  }
  if (cityscapeMatches > natureMatches && cityscapeMatches > cefaloMatches) {
    return PhotoCategory.CITYSCAPE;
  }
  
  return PhotoCategory.NATURE;
}