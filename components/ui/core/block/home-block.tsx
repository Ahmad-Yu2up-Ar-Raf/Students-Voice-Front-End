import React, { useState } from 'react';
import { Wrapper } from '../layout/wrapper';
import { Text } from '../../fragments/shadcn-ui/text';
import { Post } from '@/types/post-types';

export default function HomeBlock() {
  const [postData, setPostData] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);

    try {
    } catch (err) {
      console.log(err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <Wrapper>
      <Text>HomeBlock</Text>
    </Wrapper>
  );
}
