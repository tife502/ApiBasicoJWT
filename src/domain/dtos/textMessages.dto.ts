
export class TextMessageDto {

    private constructor(
      public readonly text: string,
    ){}
  
  
    static create( props: {[key:string]: any} ): [string?, TextMessageDto?]  {
  
      const { text } = props;
  
      if ( !text ) return ['Text property is required', undefined];
  
  
      return [undefined, new TextMessageDto(text)];
    }
  
  
  }