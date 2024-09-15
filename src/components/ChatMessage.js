import React, { useState, useEffect } from 'react';
import styles from './ChatMessage.module.css';

function formatMessage(text) {
  // Replace ** with <strong> tags
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace * with <em> tags
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace newlines with <br> tags
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

function ChatMessage({ message, addToCart }) {
  const [ingredients, setIngredients] = useState(null);
  const [formattedContent, setFormattedContent] = useState('');

  useEffect(() => {
    if (message.role === 'assistant') {
      const recipeMatch = message.content.match(/\[RECIPE_START\]([\s\S]*?)\[RECIPE_END\]/);
      const ingredientsMatch = message.content.match(/\[INGREDIENTS_JSON\]([\s\S]*?)\[\/INGREDIENTS_JSON\]/);
      
      let content = message.content;
      if (recipeMatch) {
        content = recipeMatch[1];
      }
      
      if (ingredientsMatch) {
        try {
          const ingredientsJson = JSON.parse(ingredientsMatch[1]);
          setIngredients(ingredientsJson);
          // Remove the JSON part from the displayed content
          content = content.replace(ingredientsMatch[0], '');
        } catch (error) {
          console.error('Failed to parse ingredients JSON:', error);
        }
      }
      
      setFormattedContent(formatMessage(content));
    } else {
      setFormattedContent(formatMessage(message.content));
    }
  }, [message.content, message.role]);

  const handleAddToCart = () => {
    if (ingredients) {
      addToCart(ingredients);
    }
  };

  return (
    <div className={`${styles.message} ${styles[message.role]}`}>
      <div className={styles.messageContent} dangerouslySetInnerHTML={{ __html: formattedContent }} />
      {ingredients && (
        <button className={styles.addToCartButton} onClick={() => addToCart(ingredients)}>Add to Cart</button>
      )}
    </div>
  );
}

export default ChatMessage;