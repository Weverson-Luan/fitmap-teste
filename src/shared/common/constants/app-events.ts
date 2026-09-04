/** Evento emitido após operações que alteram saldo de moedas (ex.: assinatura de plano). */
export const WALLET_BALANCE_CHANGED_EVENT = "fitmap_wallet_balance_changed";

/** Evento emitido quando uma nova mensagem direta chega (FCM / sync). */
export const DIRECT_CHAT_MESSAGE_RECEIVED_EVENT = "fitmap_direct_chat_message_received";

/** Evento emitido após marcar mensagens como lidas ou sincronizar contador. */
export const DIRECT_CHAT_UNREAD_COUNT_CHANGED_EVENT = "fitmap_direct_chat_unread_count_changed";

/** Evento emitido quando chega push que persiste notificação in-app (treino, conexão, moedas, etc.). */
export const IN_APP_NOTIFICATION_PUSH_RECEIVED_EVENT = "fitmap_in_app_notification_push_received";
