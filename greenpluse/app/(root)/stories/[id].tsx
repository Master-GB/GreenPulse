import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Heart, Send } from 'lucide-react-native';

type Comment = {
  id: string;
  author: string;
  text: string;
  time: string;
};

export default function StoryDetails() {
  const params = useLocalSearchParams();
  const id = String(params.id ?? '0');
  const title = String(params.title ?? 'Community Story');
  const image = String(
    params.image ?? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400'
  );
  const body = String(
    params.body ??
      'This community effort showcases how clean energy transforms daily life — from lighting homes to powering education and healthcare.'
  );

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<number>(128);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([ 
    { id: 'c1', author: 'Aisha', text: 'So inspiring! Proud to be part of this ', time: '2h' },
    { id: 'c2', author: 'Ravi', text: 'Kids can finally study at night. Amazing impact.', time: '5h' },
    { id: 'c3', author: 'Lena', text: 'Let’s scale this to more villages!', time: '1d' },
  ]);

  const onToggleLike = () => {
    setLiked((prev) => !prev);
    setLikes((n) => (liked ? Math.max(0, n - 1) : n + 1));
  };

  const onAddComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: 'You',
      text,
      time: 'now',
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
  };

  const likeColor = liked ? '#1AE57D' : '#9CA3AF';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View className="flex-1 bg-[#122119]">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
          {/* Hero */}
          <Image source={{ uri: image }} className="w-full h-56" resizeMode="cover" />

          {/* Header */}
          <View className="px-4 py-4">
            <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
            <Text className="text-gray-300 leading-6">{body}</Text>

            {/* Actions */}
            <View className="flex-row items-center mt-4">
              <TouchableOpacity
                onPress={onToggleLike}
                activeOpacity={0.8}
                className="flex-row items-center bg-[#1a2e2e] px-4 py-2 rounded-full mr-3"
              >
                <Heart size={18} color={likeColor} fill={liked ? likeColor : 'transparent'} />
                <Text className="text-gray-300 ml-2">{likes} Likes</Text>
              </TouchableOpacity>

              <View className="bg-[#1a2e2e] px-4 py-2 rounded-full">
                <Text className="text-gray-300">Story ID: {id}</Text>
              </View>
            </View>
          </View>

          {/* Comments */}
          <View className="px-4">
            <Text className="text-white text-xl font-bold mb-3">Comments</Text>

            {comments.map((c) => (
              <View key={c.id} className="mb-3">
                <View className="flex-row items-center mb-1">
                  <View className="w-8 h-8 rounded-full bg-[#1a2e2e] mr-2 items-center justify-center">
                    <Text className="text-[#1AE57D] font-bold">{c.author.charAt(0)}</Text>
                  </View>
                  <Text className="text-gray-300 font-semibold mr-2">{c.author}</Text>
                  <Text className="text-gray-500 text-xs">{c.time}</Text>
                </View>
                <Text className="text-gray-300 leading-5 ml-10">{c.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Composer */}
        <View className="px-4 pb-5 pt-3 bg-[#122119] border-t border-gray-800">
          <View className="flex-row items-center bg-[#1a2e2e] rounded-full px-3 py-2">
            <TextInput
              placeholder="Add a comment..."
              placeholderTextColor="#6B7280"
              className="flex-1 text-gray-200 px-2"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity activeOpacity={0.8} onPress={onAddComment} className="ml-2">
              <Send size={20} color="#1AE57D" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}