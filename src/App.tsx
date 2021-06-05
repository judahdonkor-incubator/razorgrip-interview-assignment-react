import React, { useEffect, useState } from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  Flex,
  Center,
  Square,
  StackDivider,
  Spacer,
  Divider,
  Textarea,
  Button,
  IconButton,
  Icon,
  Input,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import { UsersOnline, UserCard, User } from './user'
import axios from 'axios'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { Messenger, Messages, Message } from "./chat"

type Data = {
  message: 'users-online' | 'blocked-users' | 'user-online' | 'user-offline' | 'user-blocked' | 'user-unblocked' | 'new-message'
  data?: any
} & { [key in string]: any }

export const App = () => {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    axios
      .get('/api/user')
      .then(({ data }) => setUser(data))
      .catch(err => alert(err)) // implement later
  }, [])
  const [blockedUsers, setBlockedUsers] = useState<Parameters<typeof UsersOnline>[0]['blocked']>([])
  const [usersOnline, setUsersOnline] = useState<Parameters<typeof UsersOnline>[0]['users']>([])
  const [recipient, setRecipient] = useState<Parameters<typeof UsersOnline>[0]['recipient']>()
  const [newMessages, setNewMessages] = useState<Message[]>([])
  const [messages, setMessages] = useState<{ [key in User['sub']]: Message[] }>({})
  useEffect(() => {
    if (recipient === undefined) return
    if (messages[usersOnline[recipient].sub]) {
      setMessages({
        ...messages, ...{
          [usersOnline[recipient].sub]: [
            ...messages[usersOnline[recipient].sub],
            ...newMessages.filter(({ recipientId }) => usersOnline[recipient].sub === recipientId)]
        }
      })
      setNewMessages(newMessages.filter(({ recipientId }) => usersOnline[recipient].sub !== recipientId))
    }
    else
      axios
        .get(`/api/chat/${usersOnline[recipient].sub}`)
        .then(res => {
          setMessages({
            ...messages, ...{
              [usersOnline[recipient].sub]: res.data
            }
          })
          setNewMessages(newMessages
            .filter(({ recipientId }) => usersOnline[recipient].sub !== recipientId))
        })
  }, [recipient])
  useWebSocket(`ws://localhost:8080?token=${user?.sub}`, {
    onMessage: e => {
      const msg: Data = JSON.parse(e.data)
      switch (msg.message) {
        case "blocked-users":
          setBlockedUsers(msg.data)
          break;
        case "users-online":
          setUsersOnline(msg.data)
          break;
        case "user-blocked":
          setBlockedUsers(arr => [...arr, msg.data])
          break;
        case "user-unblocked":
          setBlockedUsers(arr => [...arr.filter(sub => sub !== msg.data)])
          break;
        case "new-message":
          if (recipient !== undefined) {
            if ([msg.data.recipientId, msg.data.senderId].includes(usersOnline[recipient].sub))
              setMessages({
                ...messages, ...{
                  [usersOnline[recipient].sub]: [
                    ...messages[usersOnline[recipient].sub],
                    msg.data]
                }
              })
          } else
            setNewMessages(arr => [...arr, msg.data])
          break;

        default:
          break;
      }
    }
  }, !!user)
  return (
    <ChakraProvider theme={theme}>
      {user && (
        <Flex h="100vh">
          <VStack
            align="stretch"
          >
            <Flex>
              <Box p="4">
                <UserCard user={user} />
              </Box>
              <Spacer />
              <Box p="4">
                <ColorModeSwitcher justifySelf="flex-end" />
              </Box>
            </Flex>
            <UsersOnline
              users={usersOnline}
              blocked={blockedUsers}
              recipient={recipient}
              setRecipient={setRecipient} />
          </VStack>
          <Divider orientation="vertical" borderColor="gray.200" h='100vh' />
          <Flex flex="1" direction='column' >
            {recipient !== undefined ? (
              <>
                <Flex>
                  <Box p="4">
                    <UserCard user={usersOnline[recipient]} />
                  </Box>
                  <Spacer />
                  <Box p="4">
                    <Button
                      variant="outline"
                      aria-label='Block user'
                      onClick={() => (axios.request({
                        method: blockedUsers.includes(usersOnline[recipient].sub) ? 'DELETE' : 'PATCH',
                        url: `/api/user/blocked/${usersOnline[recipient].sub}`
                      }))}>
                      {blockedUsers.includes(usersOnline[recipient].sub) ? 'Unblock' : 'Block'}
                    </Button>
                  </Box>
                </Flex>
                <Box flex="1" overflow='scroll'>
                  <Messages
                    data={messages[usersOnline[recipient].sub]}
                    recipient={usersOnline[recipient].sub} />
                </Box>
                <Messenger recipient={usersOnline[recipient].sub} />
              </>
            ) : (
              <p>Empty</p>
            )}
          </Flex>
        </Flex>
      )}
    </ChakraProvider>
  )
}
