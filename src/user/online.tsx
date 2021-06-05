import { Box, StackDivider, VStack } from "@chakra-ui/layout"
import { User, UserCard } from '.'
import React, { useEffect, Dispatch, SetStateAction } from "react"

export const UsersOnline = ({ users, blocked, recipient, setRecipient }: {
    users: User[]
    blocked: string[]
    recipient?: number
    setRecipient: Dispatch<SetStateAction<number | undefined>>
}) => {

    return (
        <VStack
            divider={<StackDivider borderColor="gray.200" />}
            spacing={4}
            align="stretch"
        >
            {users.map((user, idx) => (
                <Box
                    cursor='pointer'
                    key={user.sub}
                    p={4}
                    _hover={{ bg: 'gray.50' }}
                    bg={idx === recipient ? 'gray.100' : undefined}
                    onClick={() => setRecipient(idx)}>
                    <UserCard
                        user={user} />
                </Box>
            ))}
        </VStack>
    )
}