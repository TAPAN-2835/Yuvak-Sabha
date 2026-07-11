import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as groupService from "@/services/groupService";
import * as yuvakService from "@/services/yuvakService";
import * as sabhaService from "@/services/sabhaService";
import * as attendanceService from "@/services/attendanceService";
import * as followupService from "@/services/followupService";
import * as settingsService from "@/services/settingsService";
import * as statsService from "@/services/statisticsService";
import type { Group, Yuvak, AppSettings } from "@/types";

const defaultQueryOptions = {
  staleTime: 30_000,
  retry: 2,
};

export function useActiveGroups() {
  return useQuery({
    queryKey: queryKeys.groupsActive,
    queryFn: groupService.listActiveGroups,
    ...defaultQueryOptions,
  });
}

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: groupService.listGroups,
    ...defaultQueryOptions,
  });
}

export function useYuvaks() {
  return useQuery({
    queryKey: queryKeys.yuvaks,
    queryFn: yuvakService.listYuvaks,
    ...defaultQueryOptions,
  });
}

export function useActiveYuvaks() {
  return useQuery({
    queryKey: queryKeys.yuvaksActive,
    queryFn: yuvakService.listActiveYuvaks,
    ...defaultQueryOptions,
  });
}

export function useYuvaksByGroup(groupId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.yuvaksByGroup(groupId),
    queryFn: () => yuvakService.listByGroup(groupId),
    enabled: Boolean(groupId) && enabled,
    ...defaultQueryOptions,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: settingsService.getSettings,
    ...defaultQueryOptions,
  });
}

export function useSabhaByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.sabhaByDate(date),
    queryFn: () => sabhaService.getOrCreateSabhaByDate(date),
    enabled: Boolean(date),
    ...defaultQueryOptions,
  });
}

export function useAttendanceForSabha(sabhaId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attendance(sabhaId ?? ""),
    queryFn: () => attendanceService.getAttendanceForSabha(sabhaId!),
    enabled: Boolean(sabhaId),
    ...defaultQueryOptions,
  });
}

export function useFollowupsByGroup(groupId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.followupsByGroup(groupId),
    queryFn: () => followupService.listFollowupsByGroup(groupId),
    enabled: Boolean(groupId) && enabled,
    ...defaultQueryOptions,
  });
}

export function useTodayFollowups(groupId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.followupsToday(groupId),
    queryFn: () => followupService.listTodayFollowups(groupId),
    enabled: Boolean(groupId) && enabled,
    ...defaultQueryOptions,
  });
}

export function useLatestSabhaSummary(
  options?: Partial<UseQueryOptions<Awaited<ReturnType<typeof statsService.latestSabhaSummary>>>>,
) {
  return useQuery({
    queryKey: queryKeys.stats.latest,
    queryFn: statsService.latestSabhaSummary,
    ...defaultQueryOptions,
    ...options,
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: queryKeys.stats.weekly,
    queryFn: () => statsService.weeklyStats(8),
    ...defaultQueryOptions,
  });
}

export function useMonthlyStats(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.stats.monthly(year, month),
    queryFn: () => statsService.monthlyStats(year, month),
    ...defaultQueryOptions,
  });
}

export function useYearlyRanking(year: number) {
  return useQuery({
    queryKey: queryKeys.stats.yearly(year),
    queryFn: () => statsService.yearlyRanking(year),
    ...defaultQueryOptions,
  });
}

export function useGroupWiseSummary(sabhaId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stats.groupWise(sabhaId ?? ""),
    queryFn: () => statsService.groupWiseSummary(sabhaId!),
    enabled: Boolean(sabhaId),
    ...defaultQueryOptions,
  });
}

export function useMonthlyTrend(year: number) {
  return useQuery({
    queryKey: queryKeys.stats.trend(year),
    queryFn: () => statsService.monthlyTrend(year),
    ...defaultQueryOptions,
  });
}

export function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.groups });
    void qc.invalidateQueries({ queryKey: queryKeys.yuvaks });
    void qc.invalidateQueries({ queryKey: queryKeys.sabhas });
    void qc.invalidateQueries({ queryKey: queryKeys.settings });
    void qc.invalidateQueries({ queryKey: queryKeys.followups });
    void qc.invalidateQueries({ queryKey: ["stats"] });
    void qc.invalidateQueries({ queryKey: ["attendance"] });
  };
}

export function useGroupMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.groups });
  };
  return {
    create: useMutation({
      mutationFn: ({
        leaderName,
        leaderMobile,
      }: {
        leaderName: string;
        leaderMobile: string | null;
      }) => groupService.createGroup(leaderName, leaderMobile),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Partial<Group> }) =>
        groupService.updateGroup(id, patch),
      onSuccess: invalidate,
    }),
    deactivate: useMutation({
      mutationFn: (id: string) => groupService.deactivateGroup(id),
      onSuccess: invalidate,
    }),
    moveYuvak: useMutation({
      mutationFn: ({ yuvakId, newGroupId }: { yuvakId: string; newGroupId: string }) =>
        groupService.moveYuvak?.(yuvakId, newGroupId) ??
        yuvakService.moveYuvak(yuvakId, newGroupId),
      onSuccess: () => {
        invalidate();
        void qc.invalidateQueries({ queryKey: queryKeys.yuvaks });
      },
    }),
  };
}

export function useYuvakMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.yuvaks });
    void qc.invalidateQueries({ queryKey: ["stats"] });
  };
  return {
    create: useMutation({
      mutationFn: (data: Omit<Yuvak, "id">) => yuvakService.createYuvak(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Partial<Yuvak> }) =>
        yuvakService.updateYuvak(id, patch),
      onSuccess: invalidate,
    }),
    deactivate: useMutation({
      mutationFn: (id: string) => yuvakService.deactivateYuvak(id),
      onSuccess: invalidate,
    }),
    activate: useMutation({
      mutationFn: (id: string) => yuvakService.activateYuvak(id),
      onSuccess: invalidate,
    }),
  };
}

export function useAttendanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sabhaId,
      presentIds,
      allIds,
    }: {
      sabhaId: string;
      presentIds: Set<string>;
      allIds: string[];
    }) => attendanceService.saveAttendance(sabhaId, presentIds, allIds),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.attendance(vars.sabhaId),
      });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      void qc.invalidateQueries({ queryKey: queryKeys.sabhas });
    },
  });
}

export function useSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}

export function useFollowupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: followupService.createFollowupLog,
    onSuccess: (_d, vars) => {
      if (vars.groupId) {
        void qc.invalidateQueries({
          queryKey: queryKeys.followupsByGroup(vars.groupId),
        });
        void qc.invalidateQueries({
          queryKey: queryKeys.followupsToday(vars.groupId),
        });
      }
    },
  });
}
