import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Custom hook for WebSocket real-time updates
 * @param {string} apiUrl - Backend URL
 * @param {number|string} clientId - Client ID for topic subscription
 * @param {function} onNewComment - Callback when new comment arrives
 * @param {function} onReplyAdded - Callback when reply is added
 */
export const useWebSocket = (apiUrl, clientId, onNewComment, onReplyAdded, topic = null) => {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const clientRef = useRef(null);

    // Store callbacks in refs to prevent unnecessary reconnections on render
    const onNewCommentRef = useRef(onNewComment);
    const onReplyAddedRef = useRef(onReplyAdded);

    // Update refs when callbacks change
    useEffect(() => {
        onNewCommentRef.current = onNewComment;
        onReplyAddedRef.current = onReplyAdded;
    }, [onNewComment, onReplyAdded]);

    const connect = useCallback(() => {
        if (!apiUrl) return;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${apiUrl}/ws-stomp`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => console.log('[STOMP]', str),
            onConnect: () => {
                console.log('✅ WebSocket conectado');
                setConnected(true);
                setError(null);

                // Option 1: Subscribe to Client Specific Topic (Dashboard)
                if (clientId) {
                    stompClient.subscribe(`/topic/client/${clientId}/comments`, (message) => {
                        handleMessage(message);
                    });
                    stompClient.subscribe(`/topic/client/${clientId}/alerts`, (message) => {
                        try {
                            const data = JSON.parse(message.body);
                            console.log('🚨 WS Alert:', data);
                        } catch (e) { console.error(e); }
                    });
                }

                // Option 2: Subscribe to Custom Public Topic (Zapateria/Libreria)
                if (topic) {
                    stompClient.subscribe(topic, (message) => {
                        handleMessage(message);
                    });
                }
            },
            onStompError: (frame) => {
                console.error('❌ STOMP Error:', frame.headers.message);
                setError(frame.headers.message);
                setConnected(false);
            },
            onWebSocketClose: () => {
                console.log('🔌 WebSocket desconectado');
                setConnected(false);
            }
        });

        const handleMessage = (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log('📩 WS Message:', data);

                if (data.type === 'NEW_COMMENT' && onNewCommentRef.current) {
                    onNewCommentRef.current(data);
                } else if (data.type === 'REPLY_ADDED' && onReplyAddedRef.current) {
                    onReplyAddedRef.current(data);
                }
            } catch (e) {
                console.error('Error parsing WS message:', e);
            }
        };

        stompClient.activate();
        clientRef.current = stompClient;
    }, [apiUrl, clientId, topic]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            setConnected(false);
        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { connected, error, reconnect: connect };
};

export default useWebSocket;
