/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

export const inviteUserToBoardSocket = (socket) => {
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}