'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { useSession } from "next-auth/react";
import ChatMessage from '../../components/ChatMessage';

export default function Dashboard() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: session, status } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartPosition, setCartPosition] = useState({ x: 20, y: 20 });
  const cartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const currentPositionRef = useRef({ x: 20, y: 20 });
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchConversations();
    }
  }, [status, session]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/conversations?email=${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const saveConversation = async (updatedConversations) => {
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: session.user.email,
          conversations: updatedConversations 
        }),
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: input };
    setConversations(prevConversations => {
      const updatedConversations = [...prevConversations];
      if (!updatedConversations[currentConversationIndex]) {
        updatedConversations[currentConversationIndex] = [];
      }
      updatedConversations[currentConversationIndex] = [...updatedConversations[currentConversationIndex], userMessage];
      return updatedConversations;
    });
    setInput('');
    setIsGenerating(true);

    try {
      const currentConversation = conversations[currentConversationIndex] || [];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          conversationHistory: [...currentConversation, userMessage]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (typeof data.message !== 'string') {
        throw new Error('Received an invalid response format');
      }

      const aiMessage = { role: 'assistant', content: data.message };
      setConversations(prevConversations => {
        const updatedConversations = [...prevConversations];
        updatedConversations[currentConversationIndex] = [...updatedConversations[currentConversationIndex], aiMessage];
        saveConversation(updatedConversations);
        return updatedConversations;
      });
    } catch (error) {
      console.error('Error:', error);
      setConversations(prevConversations => {
        const updatedConversations = [...prevConversations];
        updatedConversations[currentConversationIndex] = [
          ...updatedConversations[currentConversationIndex], 
          { role: 'error', content: error.message || 'Sorry, there was an error. Please try again.' }
        ];
        return updatedConversations;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewChat = () => {
    setCurrentConversationIndex(conversations.length);
    setConversations([...conversations, []]);
    saveConversation([...conversations, []]);
  };

  const switchConversation = (index) => {
    setCurrentConversationIndex(index);
  };

  const deleteConversation = (index) => {
    setConversations(prevConversations => {
      const updatedConversations = [...prevConversations];
      updatedConversations.splice(index, 1);
      if (currentConversationIndex >= updatedConversations.length) {
        setCurrentConversationIndex(updatedConversations.length - 1);
      }
      saveConversation(updatedConversations);
      return updatedConversations;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const addToCart = (ingredients) => {
    setCart(prevCart => [...prevCart, ingredients]);
  };

  const removeFromCart = (e, index) => {
    e.stopPropagation();
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  useEffect(() => {
    let dragStartPosition = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - dragStartPosition.x;
        const deltaY = e.clientY - dragStartPosition.y;
        const newX = currentPositionRef.current.x + deltaX;
        const newY = currentPositionRef.current.y + deltaY;
        
        requestAnimationFrame(() => {
          cartRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        });
        
        dragStartPosition = { x: e.clientX, y: e.clientY };
        currentPositionRef.current = { x: newX, y: newY };
      }
    };

    const handleMouseUp = (e) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        setCartPosition(currentPositionRef.current);
      }
    };

    const handleMouseDown = (e) => {
      if (e.target.closest(`.${styles.cartContainer}`)) {
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStartPosition = { x: e.clientX, y: e.clientY };
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const toggleCart = () => {
    setIsCartVisible(!isCartVisible);
  };

  const handleCartClick = (e) => {
    if (e.target.closest(`.${styles.cartIcon}`)) {
      e.stopPropagation();
      if (!isDragging) {
        toggleCart();
      }
    }
  };

  return (
    <div className={`${styles.container} ${isSidebarOpen ? styles.containerSidebarOpen : ''}`}>
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <h2 className={styles.sidebarTitle}>Chat History</h2>
        <button onClick={startNewChat} className={styles.newChatButton}>New Chat</button>
        <div className={styles.chatHistory}>
          {conversations.map((conversation, index) => (
            <div key={index} className={styles.historyItemContainer}>
              <div 
                className={`${styles.historyItem} ${index === currentConversationIndex ? styles.activeConversation : ''}`}
                onClick={() => switchConversation(index)}
              >
                {conversation[0]?.content.substring(0, 30) || "New Conversation"}...
              </div>
              <button 
                onClick={() => deleteConversation(index)} 
                className={styles.deleteButton}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={toggleSidebar} 
        className={`${styles.toggleButton} ${isSidebarOpen ? styles.toggleButtonOpen : ''}`}
      >
        {isSidebarOpen ? '◀' : '▶'}
      </button>
      <div className={styles.mainContent}>
        <div className={styles.chatContainer}>
          {conversations[currentConversationIndex]?.map((msg, index) => (
            <ChatMessage key={index} message={msg} addToCart={addToCart} />
          ))}
          {isGenerating && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <span className={styles.messageContent}>Generating response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cooking..."
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Send</button>
        </form>
      </div>
      <div 
        className={`${styles.cartContainer} ${isCartVisible ? styles.cartVisible : ''}`}
        style={{ 
          transform: `translate(${cartPosition.x}px, ${cartPosition.y}px)`,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
        ref={cartRef}
        onMouseDown={handleCartClick}
      >
        <div className={styles.cartHeader}>
          <span className={styles.cartIcon}>🛒</span>
        </div>
        {isCartVisible && (
          <div className={styles.cartContent} onClick={(e) => e.stopPropagation()}>
            <h2>Shopping Cart</h2>
            <div className={styles.cartItems}>
              {cart.map((item, index) => (
                <div key={index} className={styles.cartItem}>
                  <h3>{item.recipeName}</h3>
                  <ul>
                    {item.ingredients.map((ing, i) => (
                      <li key={i}>{ing.name}: {ing.quantity} {ing.unit}</li>
                    ))}
                  </ul>
                  <button onClick={(e) => removeFromCart(e, index)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
