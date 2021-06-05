import { Avatar } from "@chakra-ui/avatar";
import { Badge, Box, Flex, Text } from "@chakra-ui/layout";

export type User = Record<'name' | 'picture' | 'email' | 'sub', string>

export const UserCard = ({ user }: { user: User }) => (
    <Flex>
        <Avatar src={user.picture} />
        <Box ml="3">
            <Text fontWeight="bold">
                {user.name}
                {/* <Badge ml="1" colorScheme="green">
                    New
                </Badge> */}
            </Text>
            <Text fontSize="sm">{user.email}</Text>
        </Box>
    </Flex>
)

export { UsersOnline } from './online'