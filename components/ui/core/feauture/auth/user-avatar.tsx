import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/fragments/shadcn-ui/avatar';

import { Text } from '@/components/ui/fragments/shadcn-ui/text';
// import { useAuth, useUser } from '@clerk/clerk-expo';

import * as React from 'react';

export default function UserAvatar(props: Omit<React.ComponentProps<typeof Avatar>, 'alt'>) {
  return (
    <Avatar alt={`user's avatar`} {...props}>
      <AvatarImage
        source={{
          uri: 'https://github.com/Ahmad-Yu2up-Ar-Raf/sundress/blob/main/public/assets/images/default-avaatarjpg.jpg?raw=true',
        }}
      />
      <AvatarFallback>
        <Text>AN</Text>
      </AvatarFallback>
    </Avatar>
  );
}
