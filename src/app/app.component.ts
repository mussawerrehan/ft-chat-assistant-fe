import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'claude';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: Date;
  messages: Message[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <div class="sidebar" [class.sidebar-collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="sidebar-title" *ngIf="!sidebarCollapsed">Claude</div>
        </div>
        
        <div class="sidebar-content" *ngIf="!sidebarCollapsed">
          <button class="new-chat-btn" (click)="startNewChat()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.5v9M12.5 8h-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            New Chat
          </button>
          
          <div class="chat-history">
            <div class="chat-section">
              <h3>Today</h3>
              <div class="chat-item" 
                   *ngFor="let conv of conversations" 
                   [class.active]="conv.id === activeConversationId"
                   (click)="selectConversation(conv.id)">
                <div class="chat-title">{{conv.title}}</div>
                <div class="chat-actions">
                  <button class="chat-action-btn" (click)="deleteConversation(conv.id, $event)">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <div class="user-section">
            <div class="user-avatar">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" fill="currentColor"/>
              </svg>
            </div>
            <div class="user-info">
              <div class="user-name">User</div>
              <div class="user-plan">Free Plan</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="main-content">
        <div class="chat-container">
          <div class="chat-header">
            <div class="model-selector">
              <select [(ngModel)]="selectedModel" class="model-select">
                <option value="claude-sonnet-4">Claude Sonnet 4</option>
                <option value="claude-opus-4">Claude Opus 4</option>
              </select>
            </div>
          </div>
          
          <div class="messages-container" #messagesContainer>
            <div class="welcome-message" *ngIf="getCurrentConversation()?.messages && getCurrentConversation()!.messages?.length === 0">
              <div class="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.1"/>
                  <circle cx="24" cy="24" r="12" fill="currentColor"/>
                </svg>
              </div>
              <h2>Hello! I'm Claude.</h2>
              <p>I'm an AI assistant created by Anthropic. I'm here to help with analysis, writing, coding, and conversation.</p>
            </div>
            
            <div class="messages" *ngIf="getCurrentConversation()?.messages?.length">
              <div class="message" 
                   *ngFor="let message of getCurrentConversation()?.messages"
                   [class.user-message]="message.sender === 'user'"
                   [class.claude-message]="message.sender === 'claude'">
                <div class="message-avatar">
                  <div class="avatar" [class.user-avatar]="message.sender === 'user'" [class.claude-avatar]="message.sender === 'claude'">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" *ngIf="message.sender === 'user'">
                      <circle cx="10" cy="10" r="8" fill="currentColor"/>
                    </svg>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" *ngIf="message.sender === 'claude'">
                      <circle cx="10" cy="10" r="8" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div class="message-content">
                  <div class="message-text">{{message.content}}</div>
                  <div class="message-actions" *ngIf="message.sender === 'claude'">
                    <button class="action-btn" title="Copy">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h7A1.5 1.5 0 0 1 14 2.5v7a1.5 1.5 0 0 1-1.5 1.5H11M4 4H2.5A1.5 1.5 0 0 0 1 5.5v7A1.5 1.5 0 0 0 2.5 14h7a1.5 1.5 0 0 0 1.5-1.5V11M4 4h7a1.5 1.5 0 0 1 1.5 1.5v7" stroke="currentColor" stroke-width="1.5" fill="none"/>
                      </svg>
                    </button>
                    <button class="action-btn" title="Like">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14.5L7.1 13.7C3.4 10.4 1 8.2 1 5.5C1 3.5 2.5 2 4.5 2C5.6 2 6.6 2.5 7.3 3.3L8 4L8.7 3.3C9.4 2.5 10.4 2 11.5 2C13.5 2 15 3.5 15 5.5C15 8.2 12.6 10.4 8.9 13.7L8 14.5Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                      </svg>
                    </button>
                    <button class="action-btn" title="Dislike">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1.5L8.9 2.3C12.6 5.6 15 7.8 15 10.5C15 12.5 13.5 14 11.5 14C10.4 14 9.4 13.5 8.7 12.7L8 12L7.3 12.7C6.6 13.5 5.6 14 4.5 14C2.5 14 1 12.5 1 10.5C1 7.8 3.4 5.6 7.1 2.3L8 1.5Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="input-section">
            <div class="input-container">
              <textarea 
                [(ngModel)]="currentMessage" 
                placeholder="Message Claude..." 
                class="message-input"
                (keydown)="handleKeyDown($event)"
                #messageInput>
              </textarea>
              <button class="send-btn" 
                      [disabled]="!currentMessage.trim() || isLoading"
                      (click)="sendMessage()">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" *ngIf="!isLoading">
                  <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
                <div class="loading-spinner" *ngIf="isLoading"></div>
              </button>
            </div>
            <div class="input-footer">
              <span class="usage-note">Claude can make mistakes. Please double-check responses.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .app-container {
      display: flex;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f7f7f8;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e5e5e5;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
    }

    .sidebar-collapsed {
      width: 60px;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }

    .sidebar-toggle:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .sidebar-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    }

    .new-chat-btn {
      width: 100%;
      padding: 12px 16px;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
      margin-bottom: 20px;
    }

    .new-chat-btn:hover {
      background: #d97706;
    }

    .chat-history {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chat-section h3 {
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .chat-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s;
      group: hover;
    }

    .chat-item:hover {
      background: #f3f4f6;
    }

    .chat-item.active {
      background: #fef3c7;
    }

    .chat-title {
      font-size: 14px;
      color: #374151;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .chat-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .chat-item:hover .chat-actions {
      opacity: 1;
    }

    .chat-action-btn {
      background: none;
      border: none;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }

    .chat-action-btn:hover {
      background: #e5e7eb;
      color: #374151;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #e5e5e5;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f59e0b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }

    .user-plan {
      font-size: 12px;
      color: #6b7280;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chat-header {
      padding: 16px 24px;
      background: white;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      justify-content: center;
    }

    .model-selector {
      display: flex;
      align-items: center;
    }

    .model-select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .welcome-message {
      text-align: center;
      padding: 60px 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .welcome-icon {
      margin-bottom: 24px;
      color: #f59e0b;
    }

    .welcome-message h2 {
      font-size: 32px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
    }

    .welcome-message p {
      font-size: 16px;
      color: #6b7280;
      line-height: 1.6;
    }

    .messages {
      max-width: 768px;
      margin: 0 auto;
    }

    .message {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }

    .message-avatar {
      flex-shrink: 0;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .user-avatar {
      background: #6b7280;
    }

    .claude-avatar {
      background: #f59e0b;
    }

    .message-content {
      flex: 1;
      min-width: 0;
    }

    .message-text {
      font-size: 15px;
      line-height: 1.6;
      color: #111827;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .message-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .message:hover .message-actions {
      opacity: 1;
    }

    .action-btn {
      background: none;
      border: none;
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    /* Input Section */
    .input-section {
      background: white;
      border-top: 1px solid #e5e5e5;
      padding: 24px;
    }

    .input-container {
      max-width: 768px;
      margin: 0 auto;
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 12px;
    }

    .message-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 15px;
      line-height: 1.4;
      resize: none;
      min-height: 52px;
      max-height: 200px;
      font-family: inherit;
      background: white;
      transition: border-color 0.2s;
    }

    .message-input:focus {
      outline: none;
      border-color: #f59e0b;
    }

    .message-input::placeholder {
      color: #9ca3af;
    }

    .send-btn {
      width: 40px;
      height: 40px;
      background: #f59e0b;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .send-btn:hover:not(:disabled) {
      background: #d97706;
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .input-footer {
      text-align: center;
      margin-top: 12px;
    }

    .usage-note {
      font-size: 12px;
      color: #6b7280;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        position: absolute;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.sidebar-open {
        transform: translateX(0);
      }

      .sidebar-collapsed {
        width: 60px;
        transform: translateX(-100%);
      }

      .messages-container {
        padding: 16px;
      }

      .input-section {
        padding: 16px;
      }

      .welcome-message {
        padding: 40px 16px;
      }
    }
  `]
})
export class AppComponent {
  sidebarCollapsed = false;
  currentMessage = '';
  isLoading = false;
  selectedModel = 'claude-sonnet-4';
  activeConversationId = '1';

  conversations: Conversation[] = [
    {
      id: '1',
      title: 'New Chat',
      lastMessage: new Date(),
      messages: []
    }
  ];

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  startNewChat() {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      lastMessage: new Date(),
      messages: []
    };
    this.conversations.unshift(newConversation);
    this.activeConversationId = newId;
  }

  selectConversation(id: string) {
    this.activeConversationId = id;
  }

  deleteConversation(id: string, event: Event) {
    event.stopPropagation();
    this.conversations = this.conversations.filter(conv => conv.id !== id);
    if (this.activeConversationId === id && this.conversations.length > 0) {
      this.activeConversationId = this.conversations[0].id;
    }
  }

  getCurrentConversation(): Conversation | undefined {
    return this.conversations.find(conv => conv.id === this.activeConversationId);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: this.currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    conversation.messages.push(userMessage);

    // Update conversation title if it's the first message
    if (conversation.messages.length === 1) {
      conversation.title = this.currentMessage.slice(0, 50) + (this.currentMessage.length > 50 ? '...' : '');
    }

    const userMessageContent = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    // Simulate Claude response
    setTimeout(() => {
      const claudeMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: this.generateClaudeResponse(userMessageContent),
        sender: 'claude',
        timestamp: new Date()
      };

      conversation.messages.push(claudeMessage);
      this.isLoading = false;
    }, 1000 + Math.random() * 2000);
  }

  private generateClaudeResponse(userMessage: string): string {
    const responses = [
      "I'd be happy to help you with that! Could you provide more details about what you're looking for?",
      "That's an interesting question. Let me think about this carefully and provide you with a comprehensive answer.",
      "I understand what you're asking about. Here's my perspective on this topic...",
      "Thanks for your question! I can help you explore this further. Let me break this down for you.",
      "That's a great point to consider. Based on what you've shared, I think there are several ways to approach this.",
      "I appreciate you bringing this up. This is definitely something worth discussing in more detail."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}