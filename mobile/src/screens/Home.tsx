import { useState, useCallback } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";

import { generateRangeDatesFromYearStart } from "../utils/generate-range-dates-from-years-start";

import { api } from "../lib/axios";

import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const datesFromYearStart = generateRangeDatesFromYearStart();

const minimumSummaryDatesSizes = 18 * 5;
const amountOfDaysFill = minimumSummaryDatesSizes - datesFromYearStart.length;

type SummaryProps = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}

export function Home() {
  const { navigate } = useNavigation();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryProps[] | null>(null);

  async function fetchData() {
    try {
      setLoading(true);

      const response = await api.get('/summary');

      setSummary(response.data);
      setLoading(false);
    } catch (err) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos');
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchData();
  }, []));

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, key) => (
          <Text
            key={key}
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            style={{ width: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map(date => {
              const dayWithHabits = summary.find(day => {
                return dayjs(date).isSame(day.date, 'day');
              });

              return (
                <HabitDay
                  key={date.toISOString()}
                  onPress={() => navigate('habit', { date: date.toISOString() })}
                  date={date}
                  amountOfHabits={dayWithHabits?.amount}
                  amountCompleted={dayWithHabits?.completed}
                />
              )
            })}

            {amountOfDaysFill > 0 && Array.from({ length: amountOfDaysFill }).map((_, key) => (
              <View
                key={key}
                className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                style={{ width: DAY_SIZE, height: DAY_SIZE }} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}